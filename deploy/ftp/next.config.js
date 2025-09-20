/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // statik sunucularda sorun çıkmaması için resim optimizasyonunu esnek bırak
  images: {
    unoptimized: true,
    remotePatterns: [
      {protocol:'https', hostname:'images.unsplash.com'},
      {protocol:'https', hostname:'*'}
    ]
  }
};

// next-intl configuration
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

module.exports = withNextIntl(nextConfig);