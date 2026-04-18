import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saoatptddmtnkthvupzy.supabase.co",
      },
    ],
  },
};

export default nextConfig;
