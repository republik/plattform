const createDataLoader = require('@orbiting/backend-modules-dataloader')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

module.exports = (context) => ({
  byRepoId: createDataLoader(
    repoIds =>
      search(
        null,
        {
          filter: {
            repoId: repoIds,
            type: 'Document'
          },
          first: repoIds.length * 2
        },
        context
      )
        .then(connection => connection.nodes
          .map(node => node.entity)
        ),
    null,
    (key, rows) => rows.find(row => row.meta.repoId === key)
  )
})
