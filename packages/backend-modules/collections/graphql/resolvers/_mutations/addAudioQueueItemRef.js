const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertItem, toRefs } = require('../../../lib/AudioQueue')

// Same as addAudioQueueItem, but returns the queue as refs so a Sanity-backed
// item is actually in the reply — the caller needs the new row's `id` to move or
// remove it later, and the deprecated variant cannot represent it.
module.exports = async (_, args, context) => {
  const { entity, sequence } = args
  const { type: entityType, id: entityId } = entity
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ entityType, entityId, sequence }, context)

  return toRefs(me.id, context)
}
