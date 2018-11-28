const { getUserByAccessToken } = require('../../../lib/AccessToken')

module.exports = (_, { accessToken }, context) => {
  const { user: me } = context
  if (me) {
    return me
  }
  if (accessToken) {
    return getUserByAccessToken(accessToken, context)
  }
  return null
}
