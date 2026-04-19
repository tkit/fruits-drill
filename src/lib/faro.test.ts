import {
  getFaroAppName,
  getFaroAppVersion,
  getFaroEnvironment,
  getFaroRuntimeConfig,
  getFaroSourcemapConfig,
} from "./faro";

describe("faro helpers", () => {
  it("returns null runtime config when collector URL is missing", () => {
    expect(getFaroRuntimeConfig({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it("builds runtime config with sensible defaults", () => {
    const config = getFaroRuntimeConfig({
      NEXT_PUBLIC_FARO_URL: "https://collector.example.com/collect/abc",
      NODE_ENV: "production",
    } as NodeJS.ProcessEnv);

    expect(config).toEqual({
      url: "https://collector.example.com/collect/abc",
      app: {
        name: "fruits-drill",
        version: "unknown",
        environment: "production",
      },
      enableTracing: true,
    });
  });

  it("prefers explicit runtime metadata env vars", () => {
    expect(
      getFaroRuntimeConfig({
        NEXT_PUBLIC_FARO_URL: "https://collector.example.com/collect/abc",
        NEXT_PUBLIC_FARO_APP_NAME: "custom-app",
        NEXT_PUBLIC_FARO_APP_VERSION: "2026.04.19",
        NEXT_PUBLIC_FARO_APP_ENV: "staging",
        NEXT_PUBLIC_FARO_DISABLE_TRACING: "true",
      } as NodeJS.ProcessEnv)
    ).toEqual({
      url: "https://collector.example.com/collect/abc",
      app: {
        name: "custom-app",
        version: "2026.04.19",
        environment: "staging",
      },
      enableTracing: false,
    });
  });

  it("falls back to commit SHA for version and bundle IDs", () => {
    const env = {
      NEXT_PUBLIC_FARO_URL: "https://collector.example.com/collect/abc",
      CF_PAGES_COMMIT_SHA: "abc123",
      FARO_SOURCEMAP_ENDPOINT: "https://collector.example.com",
      FARO_SOURCEMAP_APP_ID: "app-id",
      FARO_SOURCEMAP_API_KEY: "api-key",
      FARO_SOURCEMAP_STACK_ID: "stack-id",
    } as NodeJS.ProcessEnv;

    expect(getFaroAppVersion(env)).toBe("abc123");
    expect(getFaroSourcemapConfig(env)?.bundleId).toBe("abc123");
  });

  it("returns null sourcemap config when required values are missing", () => {
    expect(
      getFaroSourcemapConfig({
        FARO_SOURCEMAP_ENDPOINT: "https://collector.example.com",
      } as NodeJS.ProcessEnv)
    ).toBeNull();
  });

  it("builds sourcemap config from env vars", () => {
    expect(
      getFaroSourcemapConfig({
        NEXT_PUBLIC_FARO_APP_NAME: "custom-app",
        FARO_SOURCEMAP_ENDPOINT: "https://collector.example.com",
        FARO_SOURCEMAP_APP_ID: "app-id",
        FARO_SOURCEMAP_API_KEY: "api-key",
        FARO_SOURCEMAP_STACK_ID: "stack-id",
        FARO_SOURCEMAP_BUNDLE_ID: "bundle-id",
      } as NodeJS.ProcessEnv)
    ).toEqual({
      endpoint: "https://collector.example.com",
      appName: "custom-app",
      appId: "app-id",
      apiKey: "api-key",
      stackId: "stack-id",
      bundleId: "bundle-id",
    });
  });

  it("exposes small helper defaults", () => {
    const env = {
      NODE_ENV: "test",
    } as NodeJS.ProcessEnv;

    expect(getFaroAppName(env)).toBe("fruits-drill");
    expect(getFaroEnvironment(env)).toBe("test");
  });
});
