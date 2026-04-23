import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.26'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'http', hostname: '192.168.1.26', port: '4000' },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy tất cả /api/* requests qua Next.js → Express backend
        // Giúp mobile devices không cần gọi trực tiếp localhost:4000
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
