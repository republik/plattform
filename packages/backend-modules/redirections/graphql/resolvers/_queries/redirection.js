const { get, maybeApplyBaseUrl } = require('../../../lib/Redirections')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, { path, externalBaseUrl }, context) => {
  const pathUrl = new URL(path, FRONTEND_BASE_URL)

  if (pathUrl.origin !== FRONTEND_BASE_URL) {
    return null
  }

  const [redirection] = await get(pathUrl.pathname, null, context).then(
    (redirection) => maybeApplyBaseUrl(externalBaseUrl, context)([redirection]),
  )

  return redirection
}
