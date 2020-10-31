import { DeclarativeConfig } from './declarative-config';
import {
  KubernetesConfig,
  KubernetesPluginConfig,
  KubernetesMethodConfig,
} from './kubernetes-config';

export declare type ConversionResultType =
  | 'kong-declarative-config'
  | 'kong-for-kubernetes';

export declare type DeclarativeConfigResult = {
  type: 'kong-declarative-config';
  label: string;
  documents: Array<DeclarativeConfig>;
  warnings: Array<{
    severity: number;
    message: string;
    range: {
      /* TODO */
    };
  }>;
};

export declare type KongForKubernetesResult = {
  type: 'kong-for-kubernetes';
  label: string;
  documents: Array<
    KubernetesConfig | KubernetesPluginConfig | KubernetesMethodConfig
  >;
  warnings: Array<{
    severity: number;
    message: string;
    range: {
      /* TODO */
    };
  }>;
};

export declare type ConversionResult =
  | DeclarativeConfigResult
  | KongForKubernetesResult;
