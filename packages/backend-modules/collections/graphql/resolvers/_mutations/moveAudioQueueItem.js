const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertItem } = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { id, sequence } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ id, sequence }, context)

  return loaders.AudioQueue.byUserId.load(me.id)
}
