const {
  getSubscriptionsForUserAndObjects
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')

const createSubscriptionConnection = (nodes, args, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsInRoles(me, ['admin', 'editor'])) {
    connection.pageInfo = null
    connection.nodes = []
  }
  return connection
}

// _meta is present on unpublished docs
// { repo { publication { commit { document } } } }
const getRepoIdsForDoc = (doc, includeParents) => ([
  (doc.meta && doc.meta.repoId) || (doc._meta && doc._meta.repoId),
  includeParents && getRepoId(
    (doc.meta && doc.meta.format) || (doc._meta && doc._meta.format)
  )
].filter(Boolean))

module.exports = {
  async subscribedBy (doc, args, context) {
    const { user: me } = context
    const { includeParents } = args

    const repoIds = getRepoIdsForDoc(doc, includeParents)

    return createSubscriptionConnection(
      await getSubscriptionsForUserAndObjects(
        null,
        {
          type: 'Document',
          ids: repoIds
        },
        context
      ),
      args,
      me
    )
  },
  async subscribedByMe (doc, args, context) {
    const { user: me } = context
    const { includeParents } = args

    const repoIds = getRepoIdsForDoc(doc, includeParents)

    return getSubscriptionsForUserAndObjects(
      me.id,
      {
        type: 'Document',
        ids: repoIds
      },
      context,
      {
        includeNotActive: true
      }
    )
      .then(res => res[0]) // with includeParents there are going to be multiple subscriptions as soon as more than just format parents are subscribable
  }
}
