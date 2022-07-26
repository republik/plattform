const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')(['@project-r/styleguide'])

module.exports = withTM(
  withBundleAnalyzer({
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
  }),
)
