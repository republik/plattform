const _ = require('lodash')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

module.exports = async (__, args, context) => {
  /*
  const {
    feed, -> OK
    userId, -> [NOT IN SCHEMA]
    dossier: dossierId, -> untested
    template, -> OK
    format: formatId, -> OK (ORGA-Problem)
    after, -> Okish
    first, -> Okish
    before, -> Okish
    last, -> UNKLAR
    path, ->
    repoId, ->
    scheduledAt ->
  } = args
  */
  const docsConnection = await search(null, {
    first: args.first,
    after: args.after,
    before: args.before,
    filter: {
      ..._.omit(args, ['first', 'after', 'before']),
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
