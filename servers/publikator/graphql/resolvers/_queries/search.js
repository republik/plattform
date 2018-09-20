const debug = require('debug')('publikator:resolver:query:search')
const { Roles: { ensureUserHasRole } } =
  require('@orbiting/backend-modules-auth')
const { getDocumentId } =
  require('@orbiting/backend-modules-search/lib/Documents')
const { graphql: { resolvers: { queries: { documents: getDocuments } } } } =
  require('@orbiting/backend-modules-documents')

const client = require('../../../lib/cache/search')

const mapHit = ({ _source }) => {
  _source.latestCommit.repo = {
    id: _source.id
  }

  return _source
}

module.exports = async (__, args, context) => {
  ensureUserHasRole(context.user, 'editor')

  debug({ args })

  const after = args.after ? JSON.parse(args.after) : {}

  Object.keys(after).forEach(key => {
    args[key] = after[key]
  })

  const {
    first = 10,
    last,
    from = 0,
    search,
    orderBy
  } = args

  const result = await client.find({
    first,
    last,
    from,
    search,
    orderBy
  })

  const hasNextPage = first > 0 && result.hits.total > from + first
  const hasPreviousPage = from > 0

  const data = {
    nodes: result.hits.hits.map(mapHit),
    totalCount: result.hits.total,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? JSON.stringify({
          first,
          from: from + first,
          search: search
        })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? JSON.stringify({
          first,
          from: from - first,
          search: search
        })
        : null
    }
  }

  const documentIds = []

  data.nodes.forEach(r => {
    r.latestPublications.forEach(p => {
      documentIds.push(getDocumentId({
        repoId: p.repo.id,
        commitId: p.commit.id,
        versionName: p.name
      }))
    })
  })

  const publicationsDocuments = await getDocuments(
    null,
    { ids: documentIds, first: documentIds.length * 2 },
    context
  )

  data.nodes = data.nodes.map(r => {
    r.latestPublications = r.latestPublications.map(p => {
      p.document = publicationsDocuments.nodes.find(d => {
        return d.commitId === p.commit.id
      })

      return p
    })

    return r
  })

  return data
}
