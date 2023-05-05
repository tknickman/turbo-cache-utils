export interface Options {
  cacheDir: string;
  list: boolean;
  limit: number;
}

export interface CacheItemMeta {
  hash: string;
  duration: number;
}

export interface Size {
  bytes: number;
  pretty: string;
}

export interface CachedFile {
  file: string;
  size: number;
}

export interface CacheDetails {
  task: {
    hash: string;
    duration: number;
  };
  paths: {
    meta: string;
    tar: string;
    uncompressed: string;
  };
  cache: {
    files: Array<CachedFile>;
    size: {
      compressed: Size;
      uncompressed: Size;
    };
  };
}