const { Roles } = require('@orbiting/backend-modules-auth')
const {
  upsertItem,
  publikatorOnly,
} = require('../../../lib/AudioQueue')

module.exports = async (_, args, context) => {
  const { id, sequence } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ id, sequence }, context)

  // publikator items only, like `User.audioQueue` — this returns the whole
  // queue as `AudioQueueItem`, which cannot represent a Sanity-backed one.
  // Clients read the full queue via the `userAudioQueue` query.
  return publikatorOnly(await loaders.AudioQueue.byUserId.load(me.id))
}
