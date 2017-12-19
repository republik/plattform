const { descending } = require('d3-array')
const {
  Roles: {
    userHasRole,
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

module.exports = async (_, args, { user, redis }) => {
  const ref = userHasRole(user, 'editor')
    ? 'prepublication'
    : 'publication'

  const repoIds = await redis.smembersAsync('repos:ids')
  const {
    feed,
    userId,
    after,
    first,
    before,
    last,
    slug
  } = args

  return Promise.all(
    repoIds.map(repoId => {
      return redis.getAsync(`repos:${repoId}/${ref}`)
        .then(publication => {
          const json = JSON.parse(publication)
          if (!json) {
            return null
          }
          return {
            id: Buffer.from(`repo:${repoId}`).toString('base64'),
            ...json.doc
          }
        })
    })
  )
    .then(docs => {
      let documents = docs.filter(Boolean)
      if (feed) {
        documents = documents.filter(d => (
          d.meta.feed ||
          (d.meta.feed === undefined && d.meta.template === 'article')
        ))
      }
      if (userId) {
        documents = documents.filter(d => {
          const userIds = (d.meta.credits || [])
            .filter(c => c.type === 'link')
            .map(c => c.url.split('~')[1])
            .filter(Boolean)
          return userIds.includes(userId)
        })
      }
      if (slug) {
        documents = documents.filter(d => (
          d.meta.slug === slug
        ))
      }

      documents = documents.sort((a, b) =>
        descending(new Date(a.meta.publishDate), new Date(b.meta.publishDate))
      )

      let readNodes = true
      // we only restrict the nodes array
      // making totalCount always available
      // - querying a single document by slug is always allowed
      if (DOCUMENTS_RESTRICT_TO_ROLES && !slug) {
        const roles = DOCUMENTS_RESTRICT_TO_ROLES.split(',')
        readNodes = userIsInRoles(user, roles)
      }

      let startIndex = 0
      let endIndex = documents.length
      if (after) {
        startIndex = documents.findIndex(node => node.id === after)
      }
      if (before) {
        endIndex = documents.findIndex(node => node.id === before)
      }
      if (first !== undefined) {
        endIndex = startIndex + first
      } else if (last !== undefined) {
        startIndex = endIndex - last
      }
      const nodes = documents.slice(startIndex, endIndex)

      const end = nodes[nodes.length - 1]
      const start = nodes[0]

      return {
        totalCount: documents.length,
        nodes: readNodes
          ? nodes
          : [],
        pageInfo: {
          endCursor: readNodes
            ? end && end.id
            : undefined,
          hasNextPage: endIndex < documents.length - 1,
          hasPreviousPage: startIndex > 0,
          startCursor: readNodes
            ? start && start.id
            : undefined
        }
      }
    })
}
