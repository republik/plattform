const { Roles } = require('@orbiting/backend-modules-auth')
const clearCollection = require('./clearCollection')
const { getCollectionName, toRefs } = require('../../../lib/AudioQueue')

// Same as clearAudioQueue, but returns the queue as refs. `clearCollection`
// deletes by (collectionId, userId), so Sanity-backed rows go too and this
// should come back empty — returned from the loader rather than hardcoded to
// `[]` so the reply reflects what is actually in the table.
module.exports = async (_, args, context) => {
  const { user: me } = context

  Roles.ensureUserHasRole(me, 'member')

  await clearCollection(null, { collectionName: getCollectionName() }, context)

  return toRefs(me.id, context)
}
