module.exports = {
  webpack: config => {
    const alias = Object.assign({}, config.resolve.alias)
    delete alias.url
    config.resolve = {
      ...config.resolve,
      alias
    }

    return config
  },
  poweredByHeader: false
}
