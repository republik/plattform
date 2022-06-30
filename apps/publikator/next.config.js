const withTM = require('next-transpile-modules')(['@project-r/styleguide'])

/**
 * @type {import('next').NextConfig}
 */
module.exports = withTM({
  eslint: {
    ignoreDuringBuilds: true,
  },
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
})
