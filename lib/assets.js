const { PUBLIC_ASSETS_URL } = process.env

module.exports = {
  createPrefixUrl: (repoId) => {
    if (!repoId) {
      throw new Error('createPrefixUrl needs a repoId')
    }
    return url => url && url.indexOf('images/') === 0
      ? `${PUBLIC_ASSETS_URL}/${repoId}/${url}`
      : url
  },

  unprefixUrl: url => url && url.indexOf(PUBLIC_ASSETS_URL) === 0
    ? /.*\/(images\/.*)/g.exec(url)[1]
    : url
}
