const { withPlausibleProxy } = require('next-plausible')

const withConfiguredPlausibleProxy = withPlausibleProxy({
  subdirectory: '__plsb',
})

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL

/**
 * Validates the CDN URL
 * @param {string} url
 * @returns {boolean}
 */
function validateUrl(url) {
  try {
    // check if the url is valid
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * @type {import('next').NextConfig}
 */
const config = {
  transpilePackages: [
    '@project-r/styleguide',
    '@republik/nextjs-apollo-client', // Ensures ES5 compatibility to work in IE11 and older safari versions
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: validateUrl(cdnUrl) ? cdnUrl : undefined,
  poweredByHeader: false,
  redirects: async () => {
    return [
      {
        source: '/geschaeftsbericht',
        destination:
          'https://cdn.repub.ch/s3/republik-assets/assets/geschaeftsbericht2017_2018_fuer_gv_und_urabstimmung.pdf',
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
}

module.exports = withConfiguredPlausibleProxy(config)
