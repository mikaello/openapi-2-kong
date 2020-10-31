import { OpenAPIV3 } from 'openapi-types';
import { getName, parseUrl } from '../common';
import { DCUpstream } from '../types/declarative-config';

export function generateUpstreams(
  api: OpenAPIV3.Document,
  tags: Array<string>
) {
  const servers = api.servers || [];

  if (servers.length === 0) {
    return [];
  }

  const upstream: DCUpstream = {
    name: getName(api),
    targets: [],
    tags,
  };

  for (const server of servers) {
    const target = parseUrl(server.url).host;
    if (target) {
      upstream.targets.push({
        target,
      });
    }
  }

  return [upstream];
}
