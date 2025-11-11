const { Roles } = require('@orbiting/backend-modules-auth')
const { reorderItems } = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { ids } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await reorderItems({ ids }, context)

  return loaders.AudioQueue.byUserId.load(me.id)
}
