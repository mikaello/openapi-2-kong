export declare type DCPlugin = {
  name: string;
  enabled?: boolean;
  config?: {
    [key: string]: Object;
  };
};

export declare type DCRoute = {
  methods: Array<string>;
  strip_path: boolean;
  tags: Array<string>;
  name: string;
  paths: Array<string>;
  plugins?: Array<DCPlugin>;
};

export declare type DCService = {
  url: string;
  name: string;
  routes: Array<DCRoute>;
  tags: Array<string>;
  plugins?: Array<DCPlugin>;
};

export declare type DCTarget = {
  target: string;
};

export declare type DCUpstream = {
  name: string;
  tags: Array<string>;
  targets: Array<DCTarget>;
};

export declare type DeclarativeConfig = {
  _format_version: '1.1';
  services: Array<DCService>;
  upstreams: Array<DCUpstream>;
};
