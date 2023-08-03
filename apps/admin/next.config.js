/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

module.exports = withBundleAnalyzer({
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client',
  ],
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
