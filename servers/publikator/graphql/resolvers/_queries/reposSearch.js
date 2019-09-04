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

/**
 * Wanders through an array of repos, and generates document IDs for all
 * available (latestest) publications. Can be used to later link.
 *
 * @param  {Array} repos
 * @return {Array}        Document IDs
 */
const getPublicationDocumentIds = (repos) => {
  const ids = []

  repos.forEach(repo => {
    if (repo.latestPublications) {
      repo.latestPublications.forEach(publication => {
        ids.push(
          getDocumentId(
            {
              repoId: publication.repo.id,
              commitId: publication.commit.id,
              versionName: publication.name
            }
          )
        )
      })
    }
  })

  return ids
}

const mapDocuments = (documents, publication) =>
  Object.assign(
    publication,
    {
      document: documents.nodes.find(findDocumentId.bind(this, publication))
    }
  )

const findDocumentId = (publication, document) => {
  const documentId = getDocumentId({
    repoId: publication.repo.id,
    commitId: publication.commit.id,
    versionName: publication.name
  })

  return document.id === documentId
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
  }, context)

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
  const documentIds = getPublicationDocumentIds(data.nodes)

  const documents = await getDocuments(
    null,
    { first: documentIds.length, ids: documentIds },
    context
  )

  // Append documents to publications
  data.nodes = data.nodes.map(repo => {
    if (repo.latestPublications) {
      repo.latestPublications =
        repo.latestPublications.map(mapDocuments.bind(this, documents))
    }
    if (repo.latestCommit) {
      repo.latestCommit.document = documents.nodes.find(d => d.commitId === repo.latestCommit.id)
    }

    return repo
  })

  return data
}
