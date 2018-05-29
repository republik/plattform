const { descending } = require('d3-array')
const visit = require('unist-util-visit')
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
  const ref = userHasRole(user, 'editor')
    ? 'prepublication'
    : 'publication'

  /*
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
  const docs = await search(null, {
    filter: {
      type: 'Document'
    },
  }, context)
    .then( result => {
      return [...result.nodes.map(node => node.entity)]
    })
  */

  const getDocsForConnection = (connection) =>
    [...connection.nodes.map(node => node.entity)]

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
  const docs = getDocsForConnection(docsConnection)

  // extract and load users
  const userIds = []
  const usernames = userIds.length
    ? await pgdb.public.users.find(
      {
        id: userIds,
        hasPublicProfile: true,
        'username !=': null
      },
      {
        fields: ['id', 'username']
      }
    )
    : []

  // extract related repoIds (from content and meta) and load
  const repoIds = []
  docs.forEach(doc => {
    // content
    visit(doc.content, 'link', node => {
      const info = extractUserUrl(node.url)
      if (info) {
        node.url = info.path
        if (isUUID.v4(info.id)) {
          userIds.push(info.id)
        } else {
          debug('documents found nonUUID %s in repo %s', info.id, doc.repoId)
        }
      }
      const repoId = getRepoId(node.url, 'autoSlug')
      if (repoId) {
        repoIds.push(repoId)
      }
    })
    // meta
    const meta = doc.content.meta
    // TODO get keys from packages/documents/lib/resolve.js
    repoIds.push(meta.dossier)
    repoIds.push(meta.format)
    repoIds.push(meta.discussion)
    if (meta.series) {
      if (typeof meta.series === 'string') {
        repoIds.push(meta.series)
      } else {
        meta.series.episodes && meta.series.episodes.forEach(episode => {
          repoIds.push(episode.document)
        })
      }
    }
  })
  // some repoIds are prefixed, some not 🤯
  // this could go to prepareMetaForPublish
  const sanitizedRepoIds = repoIds
    .filter(Boolean)
    .map(repoId => repoId.replace('https://github.com/', ''))
  const relatedDocs = await search(null, {
    filter: {
      repoId: sanitizedRepoIds,
      type: 'Document'
    }
  }, context)
    .then(getDocsForConnection)

  console.log({
    numDocs: docs.length,
    numUserIds: userIds.length,
    numRepoIds: repoIds.length,
    numRelatedDocs: relatedDocs.length
  })

  docs.forEach(doc => {
    // expose all documents to each document
    // for link resolving in lib/resolve
    // - including the usernames
    doc._all = [
      ...relatedDocs,
      ...docs
    ]
    doc._usernames = usernames
  })

  // transform SearchConnection to DocumentConnection
  return {
    ...docsConnection,
    nodes: docs
  }

  /*
  let documents = allDocuments
  if (dossierId) {
    documents = documents.filter(d => {
      const dossier = getMeta(d).dossier
      return dossier && (
        dossier.id === dossierId ||
        dossier.repoId === dossierId
      )
    })
  }
  if (formatId) {
    documents = documents.filter(d => {
      const format = getMeta(d).format
      return format && (
        format.id === formatId ||
        format.repoId === formatId
      )
    })
  }
  if (path) {
    documents = documents.filter(d => (
      d.content.meta.path === path ||
      '/'+d.content.meta.slug === path
    ))
  }
  if (repoId) {
    documents = documents.filter(d =>
      d.repoId === repoId
    )
  }
  if (template) {
    documents = documents.filter(d => (
      d.content.meta.template === template
    ))
  }

  documents = documents.sort((a, b) =>
    descending(new Date(a.content.meta.publishDate), new Date(b.content.meta.publishDate))
  )

  let readNodes = true
  // we only restrict the nodes array
  // making totalCount always available
  // - querying a single document by path is always allowed
  if (DOCUMENTS_RESTRICT_TO_ROLES && !path && !repoId) {
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
      hasNextPage: endIndex < documents.length,
      hasPreviousPage: startIndex > 0,
      startCursor: readNodes
        ? start && start.id
        : undefined
    }
  }
  */
}
