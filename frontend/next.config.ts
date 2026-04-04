import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
