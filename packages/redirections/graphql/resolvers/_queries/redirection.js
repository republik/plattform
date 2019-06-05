const { get } = require('../../../lib/Redirections')

module.exports = async (_, { path }, context) => {
  const pathUrl = new URL(path, process.env.FRONTEND_BASE_URL)

  const redirections = await get(pathUrl.pathname, null, context)
  const redirection = { __pathUrl: pathUrl, ...redirections[0] }

  return redirection
}
