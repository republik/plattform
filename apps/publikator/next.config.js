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

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer(
  withTM({
    eslint: {
      ignoreDuringBuilds: true,
    },
    generateBuildId: () => buildId,
    env: { buildId },
    webpack: (config) => {
      const alias = Object.assign({}, config.resolve.alias)
      delete alias.url
      config.resolve = {
        ...config.resolve,
        alias,
      }

      return config
    },
    poweredByHeader: false,
    async redirects() {
      return [
        {
          source: '/repo/:owner/:repo',
          destination: '/repo/:owner/:repo/tree',
          permanent: false,
        },
      ]
    },
  }),
)
