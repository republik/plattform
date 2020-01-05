const _ = require('lodash')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

module.exports = async (__, args, context, info) => {
  const docsConnection = await search(null, {
    first: args.first,
    after: args.after,
    before: args.before,
    unrestricted: args.unrestricted !== undefined
      ? args.unrestricted
      : args.template === 'section' ? true : undefined,
    filter: {
      ..._.omit(args, ['first', 'after', 'before', 'unrestricted']),
      type: 'Document'
    },
    sort: {
      key: 'publishedAt',
      direction: 'DESC'
    }
  }, context, info)

  // transform SearchConnection to DocumentConnection
  return {
    ...docsConnection,
    nodes: docsConnection.nodes
      .filter(node => node.type === 'Document')
      .map(node => node.entity)
  }
}
