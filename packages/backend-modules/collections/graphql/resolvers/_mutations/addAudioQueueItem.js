const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertItem } = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { entity, sequence } = args
  const { id: entityId } = entity
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ entityId, sequence }, context)

  return loaders.AudioQueue.byUserId.load(me.id)
}
