const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')(['@project-r/styleguide'])

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
      return [
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
      ]
    },
    async redirects() {
      return [
        // '/front' must not be reachable directly!
        // if a user is authenticated, '/' will be rewritten to '/front'
        {
          source: '/front',
          destination: '/',
          permanent: false,
        },
        // Don't allow accessing legacy marketing-/front-page
        {
          source: '/_ssr/',
          destination: '/',
          permanent: true,
        },
        {
          source: '/_ssr/:path*',
          destination: '/:path*',
          permanent: true,
        },
        {
          source: '/_ssr/front/:id*',
          destination: '/',
          permanent: true,
        },
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
      ]
    },
  }),
)
