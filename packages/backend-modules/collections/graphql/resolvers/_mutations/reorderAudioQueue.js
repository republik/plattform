const { Roles } = require('@orbiting/backend-modules-auth')
const {
  reorderItems,
  publikatorOnly,
} = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { ids } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await reorderItems({ ids }, context)

  // publikator items only, like `User.audioQueue` — this returns the whole
  // queue as `AudioQueueItem`, which cannot represent a Sanity-backed one.
  // Clients read the full queue via the `userAudioQueue` query.
  return publikatorOnly(await loaders.AudioQueue.byUserId.load(me.id))
}
