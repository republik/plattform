// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const { NODE_ENV, CDN_FRONTEND_BASE_URL } = process.env

const buildId =
  process.env.SOURCE_VERSION?.substring(0, 10) ||
  new Date(Date.now()).toISOString()

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer({
  generateBuildId: () => buildId,
  env: { BUILD_ID: buildId },
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
  assetPrefix:
    NODE_ENV === 'production' && CDN_FRONTEND_BASE_URL
      ? CDN_FRONTEND_BASE_URL
      : undefined,
  useFileSystemPublicRoutes: true,
  // , onDemandEntries: {
  //   // wait 5 minutes before disposing entries
  //   maxInactiveAge: 1000 * 60 * 5
  // }
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn', 'info'],
          }
        : false,
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
    ]
  },
  experimental: {
    largePageDataBytes: 512 * 1000, // 512KB
  },
})
