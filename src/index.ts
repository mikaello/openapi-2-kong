import fs from 'fs';
import path from 'path';
import { generateDeclarativeConfigFromSpec } from './declarative-config';
import { generateKongForKubernetesConfigFromSpec } from './kubernetes';
import SwaggerParser from '@apidevtools/swagger-parser';
import YAML from 'yaml';

import { OpenAPIV3 } from 'openapi-types';
import { ConversionResult, ConversionResultType } from './types/output';

export async function generate(
  specPath: string,
  type: ConversionResultType,
  tags: Array<string> = []
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(specPath), 'utf8', (err, contents) => {
      if (err != null) {
        reject(err);
        return;
      }

      const fileSlug = path.basename(specPath);
      const allTags = [`OAS3file_${fileSlug}`, ...tags];
      resolve(generateFromString(contents, type, allTags));
    });
  });
}

export async function generateFromString(
  specStr: string,
  type: ConversionResultType,
  tags: Array<string> = []
): Promise<ConversionResult> {
  const api: OpenAPIV3.Document = await parseSpec(specStr);
  return generateFromSpec(api, type, ['OAS3_import', ...tags]);
}

export function generateFromSpec(
  api: OpenAPIV3.Document,
  type: ConversionResultType,
  tags: Array<string> = []
): ConversionResult {
  switch (type) {
    case 'kong-declarative-config':
      return generateDeclarativeConfigFromSpec(api, tags);
    case 'kong-for-kubernetes':
      return generateKongForKubernetesConfigFromSpec(api, tags);
    default:
      throw new Error(`Unsupported output type "${type}"`);
  }
}

export async function parseSpec(
  spec: string | Object
): Promise<OpenAPIV3.Document> {
  let api: OpenAPIV3.Document;

  if (typeof spec === 'string') {
    try {
      api = JSON.parse(spec);
    } catch (err) {
      api = YAML.parse(spec);
    }
  } else {
    api = JSON.parse(JSON.stringify(spec));
  }

  // Ensure it has some required properties to make parsing
  // a bit less strict

  if (!api.info) {
    api.info = { title: '', version: '' };
  }

  if (api.openapi === '3.0') {
    api.openapi = '3.0.0';
  }

  // @ts-ignore
  return SwaggerParser.dereference(api);
}
