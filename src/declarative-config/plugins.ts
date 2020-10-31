// @flow

import { OpenAPIV3 } from 'openapi-types';
import { getPluginNameFromKey, isPluginKey } from '../common';
import { DCPlugin } from '../types/declarative-config';

export function isRequestValidatorPluginKey(key: string): boolean {
  return key.match(/-request-validator$/) != null;
}

type GeneratorFn = (
  key: string,
  value: Object,
  iterable: Object | Array<Object>
) => DCPlugin;

export function generatePlugins(
  item: Object,
  generator: GeneratorFn
): Array<DCPlugin> {
  const plugins: Array<DCPlugin> = [];

  for (const [key, value] of Object.entries(item)) {
    if (!isPluginKey(key)) {
      continue;
    }

    plugins.push(generator(key, value, item));
  }

  return plugins;
}

export function generatePlugin(key: string, value: any): DCPlugin {
  //const value = operation[key];
  const plugin: DCPlugin = {
    name: value?.name || getPluginNameFromKey(key),
  };

  if (value.config) {
    plugin.config = value.config;
  }

  return plugin;
}

export function generateRequestValidatorPlugin(
  _value: any,
  operation: OpenAPIV3.OperationObject
): DCPlugin {
  const config: { [key: string]: any } = {
    version: 'draft4', // Fixed version
  };

  config.parameter_schema = [];

  if (operation.parameters) {
    for (const parameter of operation.parameters) {
      const p = parameter as OpenAPIV3.ParameterObject;

      if (!p.schema) {
        throw new Error(
          "Parameter using 'content' type validation is not supported"
        );
      }
      config.parameter_schema.push({
        in: p.in,
        explode: !!p.explode,
        required: !!p.required,
        name: p.name,
        schema: JSON.stringify(p.schema),
        style: 'simple',
      });
    }
  }

  if (operation.requestBody) {
    const content = (operation.requestBody as OpenAPIV3.RequestBodyObject)
      .content;
    if (!content) {
      throw new Error('content property is missing for request-validator!');
    }

    let bodySchema;
    for (const [mediatype, item] of Object.entries(content)) {
      if (mediatype !== 'application/json') {
        throw new Error(
          `Body validation supports only 'application/json', not ${mediatype}`
        );
      }
      bodySchema = JSON.stringify(item.schema);
    }

    if (bodySchema) {
      config.body_schema = bodySchema;
    }
  }

  return {
    config,
    enabled: true,
    name: 'request-validator',
  };
}

export function generateServerPlugins(
  server: OpenAPIV3.ServerObject
): Array<DCPlugin> {
  const plugins: Array<DCPlugin> = [];

  const serverKeys = Object.keys(server) as Array<keyof typeof server>;
  for (const key of serverKeys) {
    if (!isPluginKey(key)) {
      continue;
    }

    plugins.push(generatePlugin(key, server[key]));
  }

  return plugins;
}

export function generateOperationPlugins(
  operation: OpenAPIV3.OperationObject
): Array<DCPlugin> {
  const plugins: Array<DCPlugin> = [];

  const operationKeys = Object.keys(operation) as Array<keyof typeof operation>;
  for (const key of operationKeys) {
    if (!isPluginKey(key)) {
      continue;
    }

    if (isRequestValidatorPluginKey(key)) {
      plugins.push(generateRequestValidatorPlugin(operation[key], operation));
    } else {
      plugins.push(generatePlugin(key, operation[key]));
    }
  }

  return plugins;
}
