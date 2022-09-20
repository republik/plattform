const { Roles } = require('@orbiting/backend-modules-auth')
const { removeItem } = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await removeItem({ id }, context)

  return loaders.AudioQueue.byUserId.load(me.id)
}
