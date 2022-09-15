const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withTM = require('next-transpile-modules')([
  '@project-r/styleguide',
  '@republik/nextjs-apollo-client',
])

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

module.exports = withTM(
  withBundleAnalyzer({
    poweredByHeader: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    generateBuildId: () => buildId,
    publicRuntimeConfig: {
      buildId,
    },
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
  }),
)
