const withTM = require('next-transpile-modules')(['@project-r/styleguide'])

module.exports = withTM({
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
})
