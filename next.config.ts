import type { NextConfig } from "next";
import FaroSourceMapUploaderPlugin from "@grafana/faro-webpack-plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saoatptddmtnkthvupzy.supabase.co",
      },
    ],
  },
  webpack: (config) => {
    const faroConfig = {
      appName: process.env.NEXT_PUBLIC_FARO_APP_NAME,
      endpoint: process.env.FARO_SOURCEMAP_ENDPOINT,
      appId: process.env.FARO_APP_ID,
      stackId: process.env.FARO_STACK_ID,
      apiKey: process.env.GRAFANA_API_KEY,
    };

    if (
      faroConfig.appName &&
      faroConfig.endpoint &&
      faroConfig.appId &&
      faroConfig.stackId &&
      faroConfig.apiKey
    ) {
      config.plugins.push(
        new FaroSourceMapUploaderPlugin({
          appName: faroConfig.appName,
          endpoint: faroConfig.endpoint,
          appId: faroConfig.appId,
          stackId: faroConfig.stackId,
          apiKey: faroConfig.apiKey,
          gzipContents: true,
          verbose: true,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
