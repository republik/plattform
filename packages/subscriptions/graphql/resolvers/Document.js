const {
  getActiveSubscriptionsForObject,
  getActiveSubscriptionByUserForObject
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')

const createSubscriptionConnection = (nodes, args, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsInRoles(me, ['admin', 'editor'])) {
    connection.pageInfo = null
    connection.nodes = []
  }
  return connection
}

const getRepoId = doc =>
  doc && doc.meta && doc.meta.repoId

module.exports = {
  async subscribedBy (doc, args, context) {
    const { user: me } = context
    const repoId = getRepoId(doc)
    if (!repoId) {
      return
    }
    return createSubscriptionConnection(
      await getActiveSubscriptionsForObject(
        {
          type: 'Document',
          id: repoId
        },
        context
      ),
      args,
      me
    )
  },
  async subscribedByMe (doc, args, context) {
    const { user: me } = context
    if (!me) {
      return
    }
    const repoId = getRepoId(doc)
    if (!repoId) {
      return
    }
    return getActiveSubscriptionByUserForObject(
      me.id,
      {
        type: 'Document',
        id: repoId
      },
      context
    )
  }
}
