const DEFAULT_FARO_APP_NAME = "fruits-drill";
const DEFAULT_FARO_APP_VERSION = "unknown";

type EnvLike = NodeJS.ProcessEnv;

export type FaroRuntimeConfig = {
  url: string;
  app: {
    name: string;
    version: string;
    environment: string;
  };
  enableTracing: boolean;
};

export type FaroSourcemapConfig = {
  endpoint: string;
  appName: string;
  appId: string;
  apiKey: string;
  stackId: string;
  bundleId?: string;
};

export function getFaroAppName(env: EnvLike = process.env): string {
  return env.NEXT_PUBLIC_FARO_APP_NAME || DEFAULT_FARO_APP_NAME;
}

export function getFaroAppVersion(env: EnvLike = process.env): string {
  return (
    env.NEXT_PUBLIC_FARO_APP_VERSION ||
    env.CF_PAGES_COMMIT_SHA ||
    env.GITHUB_SHA ||
    DEFAULT_FARO_APP_VERSION
  );
}

export function getFaroEnvironment(env: EnvLike = process.env): string {
  return env.NEXT_PUBLIC_FARO_APP_ENV || env.NODE_ENV || "production";
}

export function getFaroRuntimeConfig(env: EnvLike = process.env): FaroRuntimeConfig | null {
  if (!env.NEXT_PUBLIC_FARO_URL) {
    return null;
  }

  return {
    url: env.NEXT_PUBLIC_FARO_URL,
    app: {
      name: getFaroAppName(env),
      version: getFaroAppVersion(env),
      environment: getFaroEnvironment(env),
    },
    enableTracing: env.NEXT_PUBLIC_FARO_DISABLE_TRACING !== "true",
  };
}

export function getFaroSourcemapConfig(env: EnvLike = process.env): FaroSourcemapConfig | null {
  if (
    !env.FARO_SOURCEMAP_ENDPOINT ||
    !env.FARO_SOURCEMAP_APP_ID ||
    !env.FARO_SOURCEMAP_API_KEY ||
    !env.FARO_SOURCEMAP_STACK_ID
  ) {
    return null;
  }

  return {
    endpoint: env.FARO_SOURCEMAP_ENDPOINT,
    appName: getFaroAppName(env),
    appId: env.FARO_SOURCEMAP_APP_ID,
    apiKey: env.FARO_SOURCEMAP_API_KEY,
    stackId: env.FARO_SOURCEMAP_STACK_ID,
    bundleId: env.FARO_SOURCEMAP_BUNDLE_ID || env.CF_PAGES_COMMIT_SHA || env.GITHUB_SHA,
  };
}
