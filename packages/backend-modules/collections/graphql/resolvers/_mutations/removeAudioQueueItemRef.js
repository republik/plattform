const { Roles } = require('@orbiting/backend-modules-auth')
const { removeItem, toRefs } = require('../../../lib/AudioQueue')

// Same as removeAudioQueueItem, but returns the queue as refs.
module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await removeItem({ id }, context)

  return toRefs(me.id, context)
}
