import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fruits-drill.stdy.workers.dev";
const baseHostname = new URL(baseUrl).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saoatptddmtnkthvupzy.supabase.co",
      },
      {
        protocol: "https",
        hostname: baseHostname,
      },
    ],
  },
};

export default nextConfig;
