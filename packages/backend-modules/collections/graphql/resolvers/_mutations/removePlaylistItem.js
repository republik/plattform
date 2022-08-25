const { Roles } = require('@orbiting/backend-modules-auth')
const { removePlaylistItem } = require('../../../lib/Playlist')

module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me, loaders } = context

  Roles.ensureUserHasRole(me, 'member')

  await removePlaylistItem({ id }, context)

  return loaders.CollectionPlaylistItem.byUserId.load(me.id)
}
