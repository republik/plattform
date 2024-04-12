// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isProduction = process.env.NODE_ENV === 'production'

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

function appendProtocol(href) {
  if (href && !href.startsWith('http')) {
    return `${isProduction ? 'https' : 'http'}://${href}`
  }
  return href
}

const PUBLIC_BASE_URL = appendProtocol(
  process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL,
)

const PUBLIC_CDN_URL =
  appendProtocol(process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL) ||
  PUBLIC_BASE_URL

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  generateBuildId: () => buildId,
  env: {
    BUILD_ID: buildId,
    PUBLIC_BASE_URL,
    PUBLIC_CDN_URL,
    ...unprefixedStyleguideEnvVariables,
  },
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client', // Ensures ES5 compatibility to work in IE11 and older safari versions
    '@republik/icons', // Ensures ES5 compatibility to work in IE11 and older safari versions
  ],
  webpack: (config) => {
    config.externals = config.externals || {}
    config.externals['lru-cache'] = 'lru-cache'
    config.externals['react-dom/server'] = 'react-dom/server'
    return config
  },
  poweredByHeader: false,
  assetPrefix: isProduction ? PUBLIC_CDN_URL : undefined,
  useFileSystemPublicRoutes: true,
  // , onDemandEntries: {
  //   // wait 5 minutes before disposing entries
  //   maxInactiveAge: 1000 * 60 * 5
  // }
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['www.datocms-assets.com', 'cdn.republik.pink', 'cdn.repub.ch'],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn', 'info'],
          }
        : false,
  },
  async headers() {
    return [
      // Migrated from custom express server
      {
        source: '/:path*',
        headers: [
          // Security headers, peviously handled by helmet
          ...Object.entries({
            // 'Content-Security-Policy': `default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests`,
            // 'Cross-Origin-Opener-Policy': 'same-origin',
            // 'Cross-Origin-Resource-Policy': 'same-origin',
            // 'Origin-Agent-Cluster': '?1',
            // Preload approval for 1 year
            'Referrer-Policy': 'no-referrer',
            'Strict-Transport-Security': `max-age=${
              60 * 60 * 24 * 365
            }; includeSubDomains; preload`,
            'X-Content-Type-Options': 'nosniff',
            'X-Download-Options': 'noopen',
            'X-Frame-Options': 'SAMEORIGIN',
            // removed by helmet by default, but we keep it for now
            'X-Powered-By': 'Republik',
            'X-XSS-Protection': '1; mode=block',
          }).map(([key, value]) => ({
            key,
            value,
          })),
        ],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        // _ssr routes are only accessible via rewrites
        {
          source: '/_ssr/:path*',
          destination: '/404',
        },
      ],
      afterFiles: [
        // impossible route via file system path
        {
          source: '/~:slug',
          destination: '/~/:slug',
        },
        // Avoid SSG for extract urls used for image rendering
        {
          source: '/:path*',
          destination: '/_ssr/:path*',
          has: [{ type: 'query', key: 'extract' }],
        },
        // Avoid SSG for share urls, e.g. meta.fromQuery
        {
          source: '/:path*',
          destination: '/_ssr/:path*',
          has: [{ type: 'query', key: 'share' }],
        },
        // Rewrite for crawlers when a comment is focused inside a debate on the article-site
        {
          source: '/:path*',
          destination: '/_ssr/:path*',
          has: [
            { type: 'query', key: 'focus' },
            {
              type: 'header',
              key: 'User-Agent',
              value: '.*(Googlebot|facebookexternalhit|Twitterbot).*',
            },
          ],
        },
        {
          source: '/pgp/:userSlug',
          destination: '/api/pgp/:userSlug',
        },
      ],
    }
  },
  async redirects() {
    return [
      {
        source: '/~/:slug',
        destination: '/~:slug',
        permanent: true,
      },
      // keep query when redirecting
      {
        source: '/pledge',
        destination: '/angebote',
        permanent: true,
      },
      {
        source: '/notifications',
        destination: '/mitteilung',
        permanent: true,
      },
      {
        source: '/merci',
        destination: '/konto',
        permanent: true,
      },
      // Redirect 5-years campaign token URLs to static page
      {
        source: '/5-jahre-republik/:token',
        destination: '/5-jahre-republik',
        permanent: true,
      },
      /**
       * Migrated from custom express server
       * WebFinger
       * @see https://www.rfc-editor.org/rfc/rfc7033
       *
       * in use for Mastodon WebFinger redirect
       * "Translate `user@domain` mentions to actor profile URIs."
       * @see https://docs.joinmastodon.org/spec/webfinger/
       *
       */
      process.env.MASTODON_BASE_URL && {
        source: '/.well-known/webfinger',
        destination: process.env.MASTODON_BASE_URL + '/.well-known/webfinger',
        permanent: false,
      },
      // Migrated from custom express server
      {
        source: '/vote',
        destination: '/503',
        permanent: false,
      },
      // Migrated from custom express server
      {
        source: '/updates/wer-sind-sie',
        destination: '/503',
        permanent: false,
      },
    ].filter(Boolean)
  },
  experimental: {
    largePageDataBytes: 512 * 1000, // 512KB
    // Don't scroll to top on Browser back/forward
    // Note: This only applies to Pages Router, the App Router automatically does this: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#5-back-and-forward-navigation
    scrollRestoration: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)

// Injected content via Sentry wizard below

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: 'republik-ag',
    project: 'www-republik',
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

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
)
