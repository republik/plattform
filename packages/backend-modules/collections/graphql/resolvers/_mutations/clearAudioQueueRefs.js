const { Roles } = require('@orbiting/backend-modules-auth')
const clearCollection = require('./clearCollection')
const {
  getCollectionName,
  invalidateQueueCache,
} = require('../../../lib/AudioQueue')

// Same as clearAudioQueue, but typed as refs. `clearCollection` deletes by
// (collectionId, userId), so Sanity-backed rows go too and the queue is
// necessarily empty — no point reading it back.
module.exports = async (_, args, context) => {
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await clearCollection(null, { collectionName: getCollectionName() }, context)
  invalidateQueueCache(me.id, context)

  return []
}
