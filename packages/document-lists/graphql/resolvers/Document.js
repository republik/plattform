const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../lib/DocumentList')

module.exports = {
  async userListItems ({ meta: { repoId } }, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !repoId) {
      return []
    }
    return DocumentList.findItems({
      repoId,
      userId: me.id
    }, context)
  }
}
