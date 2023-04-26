const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer({
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client',
  ],
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  generateBuildId: () => buildId,
  env: { BUILD_ID: buildId },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: false,
      },
      {
        source: '/~:userId',
        destination: '/users/:userId',
        permanent: false,
      },
    ]
  },
})
