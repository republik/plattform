const { Roles } = require('@orbiting/backend-modules-auth')
const { reorderItems, toRefs } = require('../../../lib/AudioQueue')

// Same as reorderAudioQueue, but returns the queue as refs — which matters most
// here: a caller that submits only the ids it knows can see, in the reply, where
// the ones it did not submit ended up.
module.exports = async (_, args, context) => {
  const { ids } = args
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await reorderItems({ ids }, context)

  return toRefs(me.id, context)
}
