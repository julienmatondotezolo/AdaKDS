/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api-kds.adasystems.app',
  },
  images: {
    domains: ['api-kds.adasystems.app', 'dxxtxdyrovawugvvrhah.supabase.co'],
  },
  swcMinify: true,
  reactStrictMode: true,
}

module.exports = nextConfig