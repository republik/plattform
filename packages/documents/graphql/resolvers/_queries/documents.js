const { descending } = require('d3-array')
const isUUID = require('is-uuid')
const debug = require('debug')('documents')
const {
  Roles: {
    userHasRole,
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

const {
  getMeta
} = require('../../../lib/meta')
const {
  extractUserUrl,
  getRepoId
} = require('../../../lib/resolve')

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

module.exports = async (_, args, context) => {
  const { user, redis, pgdb } = context
  /*
  const ref = userHasRole(user, 'editor')
    ? 'prepublication'
    : 'publication'

  const {
    feed,
    userId,
    dossier: dossierId,
    template,
    format: formatId,
    after,
    first,
    before,
    last,
    path,
    repoId,
    scheduledAt
  } = args

  const repoIds = await redis.smembersAsync('repos:ids')

  const docs = await Promise.all(
    repoIds.map( async repoId => {
      let publication
      if (scheduledAt) {
        const score = await redis.zscoreAsync('repos:scheduledIds', `repos:${repoId}/scheduled-publication`)
        const repoScheduledAt = score
          ? new Date(parseInt(score))
          : null

        const scheduledDocument = repoScheduledAt
          ? await redis.getAsync(`repos:${repoId}/scheduled-publication`)
          : null

        if (scheduledDocument && repoScheduledAt <= scheduledAt) {
          publication = scheduledDocument
        }
      }

      if (!publication) {
        publication = await redis.getAsync(`repos:${repoId}/${ref}`)
      }
      const json = JSON.parse(publication)
      if (!json) {
        return null
      }

      return {
        repoId,
        id: Buffer.from(`repo:${repoId}`).toString('base64'),
        ...json.doc
      }
    })
  )
  */

  const docsConnection = await search(null, {
    filter: {
      ...args,
      type: 'Document'
    },
    sort: {
      key: 'publishedAt',
      direction: 'DESC'
    }
  }, context)

  // transform SearchConnection to DocumentConnection
  return {
    ...docsConnection,
    nodes: docsConnection.nodes
      .filter(node => node.type === 'Document')
      .map(node => node.entity)
  }

}
