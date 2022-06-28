const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')([
  '@project-r/styleguide',
  '@republik/nextjs-apollo-client', // Ensures ES5 compatibility to work in IE11
])

const { NODE_ENV, CDN_FRONTEND_BASE_URL } = process.env

module.exports = withTM(
  withBundleAnalyzer({
    webpack5: true,
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
        : '',
    useFileSystemPublicRoutes: true,
    // , onDemandEntries: {
    //   // wait 5 minutes before disposing entries
    //   maxInactiveAge: 1000 * 60 * 5
    // }
    eslint: {
      ignoreDuringBuilds: true,
    },
    async rewrites() {
      return {
        beforeFiles: [
          // /front is only accessible via _middleware rewrite
          {
            source: '/front',
            destination: '/404',
          },
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
          source: '/ud/report',
          destination: 'https://ultradashboard.republik.ch/dashboard/15',
          permanent: false,
        },
        {
          source: '/ud/daily',
          destination: 'https://ultradashboard.republik.ch/dashboard/17',
          permanent: false,
        },
        // Legacy crowdfunding pages
        {
          source: '/updates/wer-sind-sie',
          destination: '/503',
          permanent: false,
        },
        {
          source: '/vote',
          destination: '/503',
          permanent: false,
        },
      ]
    },
  }),
)
