/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      { source: '/frontend/:path*', destination: '/api/frontend' },
      { source: '/pdf/:path*', destination: '/api/pdf' },
      { source: '/proxy', destination: '/api/proxy' },
      { source: '/purgeTags', destination: '/api/purgeTags' },
      { source: '/render', destination: '/api/render' },
      { source: '/s3/:bucket/:path*', destination: '/api/s3' },
    ]
  },
}
