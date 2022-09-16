const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertPlaylistItem } = require('../../../lib/Playlist')

module.exports = async (_, args, context) => {
  const { id, sequence } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertPlaylistItem({ id, sequence }, context)

  return loaders.CollectionPlaylistItem.byUserId.load(me.id)
}
