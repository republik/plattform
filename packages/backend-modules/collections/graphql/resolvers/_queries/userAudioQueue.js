const { Roles } = require('@orbiting/backend-modules-auth')

// Bare refs, no `Document` resolution: Sanity-backed audio has no GraphQL
// `Document`, so clients take `sanityId` from here and fetch playback data
// straight from Sanity, using `mediaId` for the playback position.
//
// `User.audioQueue` stays publikator-only — see the comment there.
module.exports = async (_, args, context) => {
  const { user: me, loaders } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return []
  }

  // Already ordered by sequence by the loader.
  return loaders.AudioQueue.byUserId.load(me.id)
}
