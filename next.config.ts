import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      new URL("https://img.clerk.com/**"),
      new URL("https://j9roblfxtd.ufs.sh/**"),
    ],
  },
};

export default nextConfig;
