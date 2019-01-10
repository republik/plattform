const { Roles } = require('@orbiting/backend-modules-auth')
const UserList = require('../../lib/UserList')

module.exports = {
  async userListItems ({ meta: { repoId } }, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !repoId) {
      return []
    }
    return UserList.findDocumentItems({
      repoId,
      userId: me.id
    }, context)
  }
}
