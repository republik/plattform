const { get } = require('../../../lib/Redirections')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, { path }, context) => {
  const pathUrl = new URL(path, FRONTEND_BASE_URL)

  if (pathUrl.origin !== FRONTEND_BASE_URL) {
    return null
  }

  return get(pathUrl.pathname, null, context)
}
