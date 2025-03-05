import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? 
      { properties: ['^data-testid$'] } : undefined,
  },
};

export default nextConfig;
