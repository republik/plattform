const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')
const { getEmbedByUrl } = require('../../../lib/fetchAndStore')

module.exports = async (_, { url }, context) => {
  const { user: me } = context
  ensureUserIsInRoles(me, ['editor', 'admin'])

  return getEmbedByUrl(url, context, true)
}
