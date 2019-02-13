const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { mediaId }, context) => {
  const { user: me } = context
  if (!Roles.userIsInRoles(me, ['member'])) {
    return
  }
  return Collection.getMediaProgressItem({
    mediaId,
    userId: me.id
  }, context)
}
