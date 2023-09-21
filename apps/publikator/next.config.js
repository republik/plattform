/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
module.exports = withBundleAnalyzer({
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client',
  ],
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
})

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'republik-ag',
    project: 'publikator-republik',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
