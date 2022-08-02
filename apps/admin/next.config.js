const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withTM = require('next-transpile-modules')([
  '@project-r/styleguide',
  '@republik/nextjs-apollo-client',
])

module.exports = withTM(
  withBundleAnalyzer({
    poweredByHeader: false,
    eslint: {
      ignoreDuringBuilds: true,
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
