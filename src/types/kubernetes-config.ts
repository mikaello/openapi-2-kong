import { OpenAPIV3 } from 'openapi-types';
import { HttpMethodType } from '../common';

export declare type K8sAnnotations = {
  //'kubernetes.io/ingress.class': 'kong';
  [key: string]: string;
};

export declare type K8sMetadata = {
  name: string;
  annotations: K8sAnnotations;
};

export declare type K8sBackend = {
  serviceName: string;
  servicePort: number;
};

export declare type K8sPath = {
  path?: string;
  backend: K8sBackend;
};

export type TlsObject = { secretName: string };
export declare type K8sIngressRule = {
  host: string | null;
  tls?: { paths: Array<K8sPath>; tls?: TlsObject };
  http?: { paths: Array<K8sPath> };
};

export declare type K8sIngressRules = Array<K8sIngressRule>;

export declare type K8sSpec = {
  rules: K8sIngressRules;
};

export declare type KubernetesMethodConfig = {
  apiVersion: 'configuration.konghq.com/v1';
  kind: 'KongIngress';
  metadata: {
    name: string;
  };
  route: {
    methods: Array<HttpMethodType>;
  };
};

export declare type KubernetesPluginConfig = {
  apiVersion: 'configuration.konghq.com/v1';
  kind: 'KongPlugin';
  metadata: {
    name: string;
    global?: boolean;
  };
  config?: { [key: string]: any };
  plugin: string;
};

export declare type KubernetesConfig = {
  apiVersion: 'extensions/v1beta1';
  kind: 'Ingress';
  metadata: K8sMetadata;
  spec: K8sSpec;
};

export declare type OA3ServerKubernetesProperties = OpenAPIV3.ServerObject & {
  'x-kubernetes-backend'?: {
    serviceName: string;
    servicePort: number;
  };
  'x-kubernetes-service'?: {
    spec?: {
      ports?: Array<{
        port: number;
      }>;
    };
    metadata?: {
      name: string;
    };
  };
  'x-kubernetes-tls'?: TlsObject;
};

export declare type OA3DocumentKubernetesInfo = OpenAPIV3.Document & {
  info: {
    'x-kubernetes-ingress-metadata'?: {
      name: string;
      annotations: {
        [annotation: string]: string;
      };
    };
  };
};
