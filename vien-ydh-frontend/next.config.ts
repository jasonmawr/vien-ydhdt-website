import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.26'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.1.34:5081', '192.168.1.34', 'localhost:3000', '127.0.0.1:3000',
        'http://192.168.1.34:5081', 'http://192.168.1.34', 'http://localhost:3000', 'http://127.0.0.1:3000',
        'https://192.168.1.34:5081', 'https://192.168.1.34'
      ],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'http', hostname: '192.168.1.26', port: '4000' },
      { protocol: 'http', hostname: '192.168.1.34', port: '4000' },
      { protocol: 'http', hostname: '192.168.1.34', port: '5081' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path((?!locale$).*)',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      // Gioi thieu sub-pages → main about page
      { source: '/gioi-thieu/chung', destination: '/gioi-thieu', permanent: false },
      { source: '/gioi-thieu/chuc-nang', destination: '/gioi-thieu', permanent: false },
      { source: '/gioi-thieu/lich-su', destination: '/gioi-thieu', permanent: false },
      { source: '/gioi-thieu/so-do', destination: '/gioi-thieu', permanent: false },
      { source: '/gioi-thieu/thanh-tich', destination: '/gioi-thieu', permanent: false },
      // Old broken footer links
      { source: '/chuc-nang', destination: '/gioi-thieu', permanent: true },
      { source: '/so-do', destination: '/gioi-thieu', permanent: true },
      // Nav links mapping to existing pages
      { source: '/chuyen-gia-y-te', destination: '/bac-si', permanent: false },
      { source: '/dich-vu', destination: '/chuyen-khoa', permanent: false },
      { source: '/kham-chua-benh/guong-mat-tieu-bieu', destination: '/bac-si', permanent: false },
      { source: '/thong-tin', destination: '/lien-he', permanent: false },
      // Chuyen khoa detail slugs → main listing
      { source: '/chuyen-khoa/cham-cuu', destination: '/chuyen-khoa', permanent: false },
      { source: '/chuyen-khoa/vat-ly-tri-lieu', destination: '/chuyen-khoa', permanent: false },
      { source: '/chuyen-khoa/kham-tri', destination: '/chuyen-khoa', permanent: false },
      { source: '/chuyen-khoa/beo-phi', destination: '/chuyen-khoa', permanent: false },
      { source: '/chuyen-khoa/cay-chi', destination: '/chuyen-khoa', permanent: false },
      // Tin tuc category sub-routes
      { source: '/tin-tuc/trong-nuoc', destination: '/tin-tuc', permanent: false },
      { source: '/tin-tuc/vien', destination: '/tin-tuc', permanent: false },
      { source: '/tin-tuc/thong-bao', destination: '/tin-tuc', permanent: false },
      { source: '/tin-tuc/quoc-te', destination: '/tin-tuc', permanent: false },
      // Dao tao sub-pages → main training page
      { source: '/dao-tao/chi-dao-tuyen', destination: '/dao-tao', permanent: false },
      { source: '/dao-tao/lien-tuc', destination: '/dao-tao', permanent: false },
      { source: '/dao-tao/co-so-thuc-hanh', destination: '/dao-tao', permanent: false },
      // Thuoc sub-pages → main products page
      { source: '/thuoc-yhct/do-vien-san-xuat', destination: '/thuoc-yhct', permanent: false },
      { source: '/thuoc-yhct/lien-doanh', destination: '/thuoc-yhct', permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
