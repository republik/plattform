const { getUserByAccessToken } = require('../../../lib/AccessToken')

module.exports = (_, { accessToken }, context) => {
  const { user: me } = context
  if (accessToken) {
    return getUserByAccessToken(accessToken, context)
  }
  if (me) {
    return me
  }
  return null
}
