const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertPlaylistItem } = require('../../../lib/Playlist')

module.exports = async (_, args, context) => {
  const { item, sequence } = args
  const { id: entityId } = item
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertPlaylistItem({ entityId, sequence }, context)

  return loaders.CollectionPlaylistItem.byUserId.load(me.id)
}
