const { Roles } = require('@orbiting/backend-modules-auth')
const { toRefs } = require('../../../lib/AudioQueue')

// Bare refs, no `Document` resolution: Sanity-backed audio has no GraphQL
// `Document`, so clients take `sanityId` from here and fetch title/cover/mp3
// straight from Sanity, while `mediaId` and `userProgress` cover playback
// position.
//
// `User.audioQueue` stays publikator-only — see AudioQueue.publikatorOnly.
module.exports = async (_, args, context) => {
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return []
  }

  // Ordered by sequence, with the progress-consent flag attached — see toRefs.
  return toRefs(me.id, context)
}
