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

const encodeCursor = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

const decodeCursor = (cursor) => {
  return JSON.parse(Buffer.from(cursor, 'base64').toString())
}

module.exports = async (__, args, context) => {
  ensureUserHasRole(context.user, 'editor')

  debug({ args })

  if (args.last) {
    throw new Error('"last" argument is not implemented')
  }

  // This overwrites parameters passed via "before" cursor
  const before = args.before ? decodeCursor(args.before) : {}
  Object.keys(before).forEach(key => {
    args[key] = before[key]
  })

  // This overwrites parameters passed via "after" cursor
  const after = args.after ? decodeCursor(args.after) : {}
  Object.keys(after).forEach(key => {
    args[key] = after[key]
  })

  const {
    first = 10,
    from = 0,
    search,
    template,
    orderBy
    // last - "last" parameter is not implemented in search API
  } = args

  const result = await client.find({
    first,
    from,
    search,
    template,
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
        ? encodeCursor({
          first,
          from: from + first,
          search,
          template,
          orderBy
        })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? encodeCursor({
          first,
          from: from - first,
          search,
          template,
          orderBy
        })
        : null
    }
  }

  // The following secion will find all retrieved document IDs in publications,
  // fetch documents and merge it corresponding documents to each publication.
  // A publication will hold only one document.
  //
  // Albeit document resolver could a similar job, performing a "collected"
  // query here cost one query to ElasticSearch while leaving it to document
  // resolvers would each fire a query.
  const docIds = []

  data.nodes.forEach(repo => {
    if (repo.latestPublications) {
      repo.latestPublications.forEach(pub => {
        docIds.push(getDocumentId({
          repoId: pub.repo.id,
          commitId: pub.commit.id,
          versionName: pub.name
        }))
      })
    }
  })

  const pubDocs = await getDocuments(
    null,
    { ids: docIds, first: docIds.length * 2 },
    context
  )

  data.nodes = data.nodes.map(repo => {
    if (repo.latestPublications) {
      repo.latestPublications = repo.latestPublications.map(pub =>
        Object.assign(
          pub,
          { document: pubDocs.nodes.find(d => {
            const documentId = getDocumentId({
              repoId: pub.repo.id,
              commitId: pub.commit.id,
              versionName: pub.name
            })

            return d.id === documentId
          }) }
        )
      )
    }

    return repo
  })

  return data
}
