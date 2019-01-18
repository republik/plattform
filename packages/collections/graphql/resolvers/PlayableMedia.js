const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

module.exports = {
  userProgress ({ mediaId }, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !mediaId) {
      return
    }
    return Collection.getMediaProgressItem({
      mediaId,
      userId: me.id
    }, context)
  }
}
