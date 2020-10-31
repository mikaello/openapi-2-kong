import { OpenAPIV3 } from 'openapi-types';
import { HttpMethodType } from '../common';
import { KubernetesPluginConfig } from './kubernetes-config';

export declare type OperationPlugins = Array<{
  method?: HttpMethodType;
  plugins: Array<KubernetesPluginConfig>;
}>;

export declare type PathPlugins = Array<{
  path: string;
  plugins: Array<KubernetesPluginConfig>;
  operations: OperationPlugins;
}>;

export declare type ServerPlugins = Array<{
  server: OpenAPIV3.ServerObject;
  plugins: Array<KubernetesPluginConfig>;
}>;

export declare type Plugins = {
  global: Array<KubernetesPluginConfig>;
  servers: ServerPlugins;
  paths: PathPlugins;
};

export declare type IndexIncrement = () => number;
