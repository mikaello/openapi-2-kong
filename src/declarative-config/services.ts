// @flow

import {
  fillServerVariables,
  generateSlug,
  getAllServers,
  getName,
  HttpMethod,
  pathVariablesToRegex,
} from '../common';

import { generateSecurityPlugins } from './security-plugins';
import { generateOperationPlugins, generateServerPlugins } from './plugins';
import { OpenAPIV3 } from 'openapi-types';
import { DCService, DCRoute } from '../types/declarative-config';

export function generateServices(
  api: OpenAPIV3.Document,
  tags: Array<string>
): Array<DCService> {
  const servers = getAllServers(api);

  if (servers.length === 0) {
    throw new Error('no servers defined in spec');
  }

  // only support one service for now
  const service = generateService(servers[0], api, tags);
  return [service];
}

export function generateService(
  server: OpenAPIV3.ServerObject,
  api: OpenAPIV3.Document,
  tags: Array<string>
): DCService {
  const serverUrl = fillServerVariables(server);
  const name = getName(api);
  const service: DCService = {
    name,
    url: serverUrl,
    plugins: generateServerPlugins(server),
    routes: [],
    tags,
  };

  for (const [routePath, pathItem] of Object.entries(api.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!Object.keys(HttpMethod).includes(method)) {
        continue;
      }

      // This check is here to make Flow happy
      if (!operation) {
        continue;
      }

      // Create the base route object
      const fullPathRegex = pathVariablesToRegex(routePath);
      const route: DCRoute = {
        tags,
        name: generateRouteName(api, pathItem, method, service.routes.length),
        methods: [method.toUpperCase()],
        paths: [fullPathRegex],
        strip_path: false,
      };

      // Generate generic and security-related plugin objects
      const securityPlugins = generateSecurityPlugins(operation, api);
      const regularPlugins = generateOperationPlugins(operation);
      const plugins = [...regularPlugins, ...securityPlugins];

      // Add plugins if there are any
      if (plugins.length) {
        route.plugins = plugins;
      }

      service.routes.push(route);
    }
  }

  return service;
}

export function generateRouteName(
  api: OpenAPIV3.Document,
  pathItem: OpenAPIV3.PathItemObject & { 'x-kong-name'?: string },
  method: string,
  numRoutes: number
): string {
  const n = numRoutes;
  const name = getName(api);

  if (typeof pathItem['x-kong-name'] === 'string') {
    const pathSlug = generateSlug(pathItem['x-kong-name']);
    return `${name}-${pathSlug}-${method}`;
  }

  // If a summary key exists, use that to generate the name
  if (typeof pathItem.summary === 'string') {
    const pathSlug = generateSlug(pathItem.summary);
    return `${name}-${pathSlug}-${method}`;
  }

  // otherwise, use a unique integer to prevent collisions
  return `${generateSlug(name)}-path${n ? '_' + n : ''}-${method}`;
}
