// @flow

import { OpenAPIV3 } from 'openapi-types';
import { getSecurity } from '../common';
import { DCPlugin } from '../types/declarative-config';

export function generateSecurityPlugins(
  op: OpenAPIV3.OperationObject | undefined | null,
  api: OpenAPIV3.Document
): Array<DCPlugin> {
  const plugins = [];
  const components = api.components || {};
  const securitySchemes = components.securitySchemes || {};

  const security = op ? getSecurity(op) : getSecurity(api);
  for (const securityItem of security || []) {
    for (const name of Object.keys(securityItem)) {
      const scheme =
        (securitySchemes[name] as OpenAPIV3.SecuritySchemeObject) || {};
      const args = securityItem[name];

      const p = generateSecurityPlugin(scheme, args);

      if (p) {
        plugins.push(p);
      }
    }
  }

  return plugins;
}

export function generateApiKeySecurityPlugin(
  scheme: OpenAPIV3.ApiKeySecurityScheme
): DCPlugin {
  if (!['query', 'header', 'cookie'].includes(scheme.in)) {
    throw new Error(
      `a ${scheme.type} object expects valid "in" property. Got ${scheme.in}`
    );
  }
  if (!scheme.name) {
    throw new Error(
      `a ${scheme.type} object expects valid "name" property. Got ${scheme.name}`
    );
  }

  return {
    name: 'key-auth',
    config: { key_names: [scheme.name] },
  };
}

export function generateHttpSecurityPlugin(
  scheme: OpenAPIV3.HttpSecurityScheme
): DCPlugin {
  if ((scheme.scheme || '').toLowerCase() !== 'basic') {
    throw new Error(`Only "basic" http scheme supported. got ${scheme.scheme}`);
  }

  return { name: 'basic-auth' };
}

export function generateOpenIdConnectSecurityPlugin(
  scheme: OpenAPIV3.OpenIdSecurityScheme,
  args: Array<any>
): DCPlugin {
  if (!scheme.openIdConnectUrl) {
    throw new Error(
      `invalid "openIdConnectUrl" property. Got ${scheme.openIdConnectUrl}`
    );
  }

  return {
    name: 'openid-connect',
    config: {
      issuer: scheme.openIdConnectUrl,
      scopes_required: args || [],
    },
  };
}

export function generateOAuth2SecurityPlugin(
  _scheme: OpenAPIV3.OAuth2SecurityScheme,
  _args?: Array<any>
): DCPlugin {
  return {
    config: {
      auth_methods: ['client_credentials'],
    },
    name: 'openid-connect',
  };
}

export function generateSecurityPlugin(
  scheme: OpenAPIV3.SecuritySchemeObject,
  args: Array<any> = []
): DCPlugin | null {
  let plugin: DCPlugin | null = null;

  // Flow doesn't like this (hence the "any" casting) but we're
  // comparing the scheme type in a more flexible way to favor
  // usability
  const type = (scheme.type || '').toLowerCase();

  // Generate base plugin
  if (type === 'apikey') {
    plugin = generateApiKeySecurityPlugin(
      scheme as OpenAPIV3.ApiKeySecurityScheme
    );
  } else if (type === 'http') {
    plugin = generateHttpSecurityPlugin(scheme as OpenAPIV3.HttpSecurityScheme);
  } else if (type === 'openidconnect') {
    plugin = generateOpenIdConnectSecurityPlugin(
      scheme as OpenAPIV3.OpenIdSecurityScheme,
      args
    );
  } else if (type === 'oauth2') {
    plugin = generateOAuth2SecurityPlugin(
      scheme as OpenAPIV3.OAuth2SecurityScheme,
      args
    );
  } else {
    return null;
  }

  // Add additional plugin configuration from x-kong-* properties
  const schemeKeys = Object.keys(scheme) as Array<keyof typeof scheme>;
  for (const key of schemeKeys) {
    if (key.indexOf('x-kong-security-') !== 0) {
      continue;
    }

    const kongSecurity: any = scheme[key];

    if (kongSecurity.config) {
      plugin.config = kongSecurity.config;
    }
  }

  return plugin;
}
