const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertItem, toRefs } = require('../../../lib/AudioQueue')

// Same as moveAudioQueueItem, but returns the queue as refs.
module.exports = async (_, args, context) => {
  const { id, sequence } = args
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ id, sequence }, context)

  return toRefs(me.id, context)
}
