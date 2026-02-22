// 파일 목적: Next.js 빌드 및 런타임 설정
// 주요 기능: standalone output, 개발 환경 API 프록시 rewrites
// 사용 방법: Next.js가 자동으로 로드

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ["localhost", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
