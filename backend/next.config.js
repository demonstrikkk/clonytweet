/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true // enables /api/route.js structure
  }
};

export default nextConfig;
