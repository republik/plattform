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

const unprefixedStyleguideEnvVariables = {
  // loop over all env vars and filter out the ones that start with "NEXT_PUBLIC_SG_"
  // then remove the prefix and return the object
  // this is needed because the styleguide expects the variables without the prefix
  // but we need the prefix for the nextjs config
  ...Object.entries(process.env)
    .filter(
      ([key]) => key.startsWith('NEXT_PUBLIC_SG_') || key.startsWith('SG_'),
    )
    .map(([key, value]) => [key.replace('NEXT_PUBLIC_', ''), value])
    .reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, []),
}

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer(
  withTM({
    eslint: {
      ignoreDuringBuilds: true,
    },
    generateBuildId: () => buildId,
    env: { BUILD_ID: buildId, ...unprefixedStyleguideEnvVariables },
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
