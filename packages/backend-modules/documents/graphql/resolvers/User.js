const { Roles } = require('@orbiting/backend-modules-auth')
const emptyDocumentConnection = require('../../lib/emptyDocumentConnection')

module.exports = {
  // Only `totalCount` is meaningful: it is the number of published Sanity
  // articles the user contributed to. `nodes` is always empty, since a Sanity
  // article can't be resolved to a GraphQL `Document`.
  async documents(user, args, context) {
    const { user: me, loaders } = context
    if (!Roles.userIsMeOrProfileVisible(user, me)) {
      return emptyDocumentConnection
    }

    const row = await loaders.Document.articleCountByUserId.load(user.id)

    return { ...emptyDocumentConnection, totalCount: row?.count ?? 0 }
  },
}
