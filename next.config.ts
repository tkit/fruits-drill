import type { NextConfig } from "next";
import { createRequire } from "node:module";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { getFaroSourcemapConfig } from "./src/lib/faro";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const require = createRequire(import.meta.url);
const faroSourcemapConfig = getFaroSourcemapConfig(process.env);

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: Boolean(faroSourcemapConfig),
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudflare-image-loader.ts",
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer && faroSourcemapConfig) {
      const FaroSourceMapUploaderPlugin = require("@grafana/faro-webpack-plugin");

      config.plugins ??= [];
      config.plugins.push(
        new FaroSourceMapUploaderPlugin({
          ...faroSourcemapConfig,
          nextjs: true,
          prefixPath: "/",
          gzipContents: true,
          keepSourcemaps: false,
          recursive: true,
          verbose: process.env.FARO_SOURCEMAP_VERBOSE === "true",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
