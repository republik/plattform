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
  transpileModules: ['@project-r/styleguide', '@republik/nextjs-apollo-client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  generateBuildId: () => buildId,
  env: { BUILD_ID: buildId },
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
})
