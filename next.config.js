/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  experimental: { 
    // Remove turbo since it's deprecated
  },   
  output: 'standalone'          // Plesk için ideal
};

// next-intl configuration - using the correct import path
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

module.exports = withNextIntl(nextConfig);