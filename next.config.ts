import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@neondatabase/serverless", "@mastra/*"],
};

export default nextConfig;
