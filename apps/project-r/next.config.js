const { withPlausibleProxy } = require('next-plausible')

/**
 * @type {import('next').NextConfig}
 */

const withConfiguredPlausibleProxy = withPlausibleProxy({
  subdirectory: '__plsb',
})

module.exports = withConfiguredPlausibleProxy({
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client', // Ensures ES5 compatibility to work in IE11 and older safari versions
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  redirects: async () => {
    return [
      {
        source: '/geschaeftsbericht',
        destination:
          'https://cdn.republik.space/s3/republik-assets/assets/geschaeftsbericht2017_2018_fuer_gv_und_urabstimmung.pdf',
        permanent: true,
      },
      {
        source: '/crew',
        destination: '/',
        permanent: false,
      },
      {
        source: '/media',
        destination: '/media/2017-01-10-hotel-rothaus',
        permanent: true,
      },
      {
        source: '/newsletter',
        destination: '/newsletter/2017-01-10-hotel-rothaus',
        permanent: true,
      },
      {
        source: '/welcome_aboard',
        destination: '/newsletter/welcome',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/',
        permanent: true,
      },
    ]
  },
})
