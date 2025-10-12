import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://img.clerk.com/**"),
      new URL("https://j9roblfxtd.ufs.sh/**"),
    ],
  },
};

export default nextConfig;
