/* const { descending } = require('d3-array')
const isUUID = require('is-uuid')

const debug = require('debug')('documents')
const {
  Roles: {
    userHasRole,
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

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
*/

const _ = require('lodash')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

module.exports = async (__, args, context) => {
  // const { user, redis, pgdb } = context
  /*
  const {
    feed, -> OK
    userId, -> [NOT IN SCHEMA]
    dossier: dossierId, -> untested
    template, -> OK
    format: formatId, -> OK (ORGA-Problem)
    after, -> UNKLAR
    first, -> Okish
    before, -> UNKLAR
    last, -> UNKLAR
    path, ->
    repoId, ->
    scheduledAt ->
  } = args
  */

  const docsConnection = await search(null, {
    first: args.first || 1000,
    filter: {
      ..._.omit(args, ['first']),
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
