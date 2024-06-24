/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withBundleAnalyzer({
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  generateBuildId: () => buildId,
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client',
  ],
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
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          process.env.CSP_FRAME_ANCESTORS && {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${process.env.CSP_FRAME_ANCESTORS.split(
              ',',
            ).join(' ')}`,
          },
        ].filter(Boolean),
      },
    ]
  },
})

module.exports = withBundleAnalyzer(nextConfig)

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'republik',
    project: 'admin-republik',

    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
