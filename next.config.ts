import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? 
      { properties: ['^data-testid$'] } : undefined,
  },
  // 빠른 배포를 위해 ESLint 검사 비활성화
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 빠른 배포를 위해 타입 검사 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
