const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')(['@project-r/styleguide'])

const { NODE_ENV, CDN_FRONTEND_BASE_URL } = process.env

module.exports = withTM(
  withBundleAnalyzer({
    compiler: {
      reactRemoveProperties: {
        properties: ['^data-test'],
      },
    },
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
      return [
        {
          source: '/~:slug',
          destination: '/~/:slug',
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
      ]
    },
    async redirects() {
      return [
        {
          source: '/_ssr/:path*',
          destination: '/:path*',
          permanent: true,
        },
        {
          source: '/~/:slug',
          destination: '/~:slug',
          permanent: true,
        },
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
      ]
    },
  }),
)
