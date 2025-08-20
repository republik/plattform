// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withPlausibleProxy } = require('next-plausible')

const isProduction = process.env.NODE_ENV === 'production'

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

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

const PUBLIC_CDN_URL = process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL
  ? appendProtocol(process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL)
  : ''

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  generateBuildId: () => buildId,
  env: {
    BUILD_ID: buildId,
    PUBLIC_BASE_URL,
    PUBLIC_CDN_URL,
  },

  poweredByHeader: false,
  assetPrefix: isProduction ? PUBLIC_CDN_URL : undefined,

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'www.datocms-assets.com',
      'cdn.republik.pink',
      'cdn.repub.ch',
      'localhost',
    ],
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
        headers:
          // Security headers, peviously handled by helmet
          Object.entries({
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
            'X-Robots-Tag': process.env.ROBOTS_TAG_HEADER,
          })
            .filter(([, value]) => !!value)
            .map(([key, value]) => ({ key, value })),
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
        {
          source: '/graphql',
          destination: process.env.NEXT_PUBLIC_API_URL,
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
      {
        source: '/umfrage/1-minute',
        destination: '/komplizin',
        permanent: true,
      },
      // Redirect /angebote to shop if no query params are set
      // {value: undefined} matchaes any value provided to that query param
      process.env.NEXT_PUBLIC_SHOP_BASE_URL && {
        source: '/angebote',
        missing: [
          // Don't redirect these packages, since we use them for payment slips or gifts
          { type: 'query', key: 'package', value: 'PROLONG' },
          { type: 'query', key: 'package', value: 'ABO' },
          { type: 'query', key: 'package', value: 'DONATE' },
          { type: 'query', key: 'package', value: 'BENEFACTOR' },
          { type: 'query', key: 'package', value: 'ABO_GIVE' },
          { type: 'query', key: 'package', value: 'ABO_GIVE_MONTHS' },
          // Not sure what this is
          { type: 'query', key: 'goto', value: undefined },
        ],
        destination: process.env.NEXT_PUBLIC_SHOP_BASE_URL,
        permanent: false,
      },
      // Redirect 5-years campaign token URLs to static page
      {
        source: '/5-jahre-republik/:token',
        destination: '/5-jahre-republik',
        permanent: true,
      },
      // Klimakurs
      // We can't use our redirection system because
      // - the page must exist and be published (to include it on the Challenge Accepted overview)
      // - this redirection must take precedence (which normal redirections don't if a page/article exists already)
      {
        source: '/klimakurs',
        destination: 'https://mailchi.mp/republik.ch/klimakurs',
        permanent: false,
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
      {
        source: '/updates',
        destination: '/crowdfunding-updates',
        permanent: true,
      },
      // Migrated from static questionnaire pages
      {
        source: '/klimafragebogen/:id',
        destination: '/15-fragen-zum-klima-ihre-antworten?share=submission-:id',
        permanent: true,
      },
      {
        source: '/fragebogen-klimakrise/:id',
        destination:
          '/2023/11/07/so-blicken-sie-auf-die-klimakrise?share=submission-:id',
        permanent: true,
      },
      {
        source: '/politikfragebogen-community/:id',
        destination:
          '/politik-in-26-fragen-ihre-antworten?share=submission-:id',
        permanent: true,
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

const withConfiguredPlausibleProxy = withPlausibleProxy({
  subdirectory: '__plsb',
})

module.exports = withSentryConfig(
  withBundleAnalyzer(withConfiguredPlausibleProxy(nextConfig)),
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
