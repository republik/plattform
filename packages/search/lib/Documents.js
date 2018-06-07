const debug = require('debug')('search:lib:Documents')
const {
  termEntry,
  countEntry,
  dateRangeParser
} = require('./schema')

const {
  rangeAggBuilder,
  valueCountAggBuilder,
  existsCountAggBuilder
} = require('./aggregations')

const {
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder,
  hasCriteriaBuilder,
  termCriteriaBuilder
} = require('./filters')

// mean German, see http://iovs.arvojournals.org/article.aspx?articleid=2166061
const WORDS_PER_MIN = 180

const SHORT_DURATION_MINS = 5
const MIDDLE_DURATION_MINS = 15
const LONG_DURATION_MINS = 30

const getDocumentId = ({repoId, commitId, versionName}) =>
  Buffer.from(`${repoId}/${commitId}/${versionName}`).toString('base64')

const getRepoIdFromDocumentId = id => {
  const repoIdRegex = new RegExp(/^(.+?\/.+?)(\/.*)?$/g)
  const matches = repoIdRegex.exec(Buffer.from(id, 'base64').toString('utf8'))
  return matches && matches[1]
}

const documentIdParser = value => {
  const parsedRepoId = getRepoIdFromDocumentId(value)
  const githubUrl = 'https://github.com'
  if (parsedRepoId) {
    return [
      `${githubUrl}/${parsedRepoId}`,
      parsedRepoId,
      value
    ]
  } else {
    return [
      `${githubUrl}/${value}`,
      value
    ]
  }
}

const schema = {
  type: termEntry('__type'),
  template: termEntry('meta.template'),
  dossier: {
    criteria: termCriteriaBuilder('meta.dossier'),
    agg: valueCountAggBuilder('meta.dossier'),
    parser: documentIdParser
  },
  format: {
    criteria: termCriteriaBuilder('meta.format'),
    agg: valueCountAggBuilder('meta.format'),
    parser: documentIdParser
  },
  repoId: {
    criteria: termCriteriaBuilder('meta.repoId')
  },
  path: {
    criteria: termCriteriaBuilder('meta.path.keyword')
  },
  userId: {
    ...termEntry('meta.credits.url'),
    parser: (value) => `/~${value}`
  },
  publishedAt: {
    criteria: dateRangeCriteriaBuilder('meta.publishDate'),
    parser: dateRangeParser
  },
  scheduledAt: {
    criteria: dateRangeCriteriaBuilder('meta.scheduledAt'),
    parser: dateRangeParser
  },
  feed: countEntry('meta.feed'),
  discussion: {
    criteria: hasCriteriaBuilder('meta.discussionId'),
    agg: valueCountAggBuilder('meta.discussionId')
  },
  audioSource: {
    criteria: hasCriteriaBuilder('meta.audioSource'),
    agg: existsCountAggBuilder('meta.audioSource')
  },
  hasAudio: countEntry('meta.hasAudio'),
  hasVideo: countEntry('meta.hasVideo'),
  isSeriesMaster: countEntry('meta.isSeriesMaster'),
  isSeriesEpisode: countEntry('meta.isSeriesEpisode'),
  textLength: {
    criteria: rangeCriteriaBuilder('contentString.count'),
    agg: rangeAggBuilder('contentString.count'),
    options: {
      filter: {
        bool: {
          must: { exists: {
            field: 'contentString.count'
          } },
          must_not: { terms: {
            'meta.template': ['format', 'discussion']
          } }
        }
      },
      ranges: [
        { key: 'short',
          to: WORDS_PER_MIN * SHORT_DURATION_MINS },
        { key: 'medium',
          from: WORDS_PER_MIN * SHORT_DURATION_MINS,
          to: WORDS_PER_MIN * MIDDLE_DURATION_MINS },
        { key: 'long',
          from: WORDS_PER_MIN * MIDDLE_DURATION_MINS,
          to: WORDS_PER_MIN * LONG_DURATION_MINS },
        { key: 'epic',
          from: WORDS_PER_MIN * LONG_DURATION_MINS }
      ]
    }
  }
}

const mdastToString = require('mdast-util-to-string')
const { mdastFilter } = require('./utils.js')

const getElasticDoc = ({ doc, commitId, versionName }) => {
  const meta = doc.content.meta
  const id = getDocumentId({repoId: meta.repoId, commitId, versionName})
  return {
    __type: indexType,
    __sort: {
      date: meta.publishDate
    },
    id,
    // repoId, is in meta now
    meta,
    content: doc.content,
    contentString: mdastToString(
      mdastFilter(
        doc.content,
        node => node.type === 'code'
      )
    )
  }
}

const {
  extractUserUrl,
  getRepoId
} = require('@orbiting/backend-modules-documents/lib/resolve')

const visit = require('unist-util-visit')
const isUUID = require('is-uuid')

const addRelatedDocs = async ({ connection, context }) => {
  const search = require('../graphql/resolvers/_queries/search')
  const { pgdb } = context

  const getDocsForConnection = (connection) =>
    [
      ...connection.nodes
        .filter(node => node.type === 'Document')
        .map(node => node.entity)
    ]

  const docs = getDocsForConnection(connection)

  // extract users and related repoIds (from content and meta)
  const userIds = []
  const repoIds = []
  docs.forEach(doc => {
    // from content
    visit(doc.content, 'link', node => {
      const info = extractUserUrl(node.url)
      if (info) {
        node.url = info.path
        if (isUUID.v4(info.id)) {
          userIds.push(info.id)
        } else {
          debug(
            'addRelatedDocs found nonUUID %s in repo %s',
            info.id,
            doc.repoId
          )
        }
      }
      const repoId = getRepoId(node.url, 'autoSlug')
      if (repoId) {
        repoIds.push(repoId)
      }
    })
    // from meta
    const meta = doc.content.meta
    // TODO get keys from packages/documents/lib/resolve.js
    repoIds.push(getRepoId(meta.dossier))
    repoIds.push(getRepoId(meta.format))
    repoIds.push(getRepoId(meta.discussion))
    if (meta.series) {
      if (typeof meta.series === 'string') {
        repoIds.push(getRepoId(meta.series))
      } else {
        meta.series.episodes && meta.series.episodes.forEach(episode => {
          repoIds.push(getRepoId(episode.document))
        })
      }
    }
  })

  // load users
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

  const sanitizedRepoIds = [...new Set(repoIds.filter(Boolean))]

  const relatedDocs = await search(null, {
    skipLoadRelatedDocs: true,
    first: sanitizedRepoIds.length,
    filter: {
      repoId: sanitizedRepoIds,
      type: 'Document'
    }
  }, context)
    .then(getDocsForConnection)

  // TODO remove
  console.log('------------------------------------------------------')
  console.log({
    numDocs: docs.length,
    numUserIds: userIds.length,
    numRepoIds: repoIds.length,
    numRelatedDocs: relatedDocs.length
  })
  console.log('------------------------------------------------------')

  // mutate docs
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
}

const { getIndexAlias } = require('./utils')
const indexType = 'Document'
const indexRef = {
  index: getIndexAlias(indexType.toLowerCase(), 'write'),
  type: indexType
}

const logQuery = (name, query) =>
  console.log(name, JSON.stringify(query))

const del = async (filter, elastic) => {
  if (
    !filter || !filter.bool || !filter.bool.must ||
    !filter.bool.must.find(m => m.term && m.term['meta.repoId'])
  ) {
    logQuery('delete missing repoId!', filter)
    throw new Error('delete missing repoId!')
  }
  const query = {
    ...indexRef,
    body: {
      query: filter
    }
  }
  logQuery('deleteByQuery', query)
  return elastic.deleteByQuery(query)
}
const removeVisibility = async (filter, visibility, elastic) => {
  const query = {
    ...indexRef,
    conflicts: 'proceed',
    body: {
      query: filter,
      script: {
        source: `if (ctx._source.containsKey('visibility') && !ctx._source.visibility.empty) { ctx._source.visibility.remove(ctx._source.visibility.indexOf("${visibility}")); }`,
        lang: 'painless'
      }
    }
  }
  logQuery('updateByQuery', query)
  return elastic.updateByQuery(query)
}
const removeScheduledAt = async (filter, elastic) => {
  const query = {
    ...indexRef,
    body: {
      query: filter,
      script: `ctx.remove("visibility");`
    }
  }
  logQuery('updateByQuery', query)
  return elastic.updateByQuery(query)
}
const getFilter = (visibilities, scheduledAt, repoId, id, notId) => {
  const filter = {
    bool: {
      must: [
        ...visibilities !== undefined && visibilities !== null
          ? [{
            script: {
              script: {
                source: "if (doc.containsKey('visibility') && params.visibilities.containsAll(doc['visibility'].values)) { return true; }",
                lang: 'painless',
                params: { visibilities }
              }
            }
          }]
          : [],
        ...repoId !== undefined && repoId !== null
          ? [ { term: { 'meta.repoId': repoId } } ]
          : [ ]
      ]
    }
  }
  if (scheduledAt !== undefined && scheduledAt !== null) {
    const scheduledAtClause = scheduledAt ? 'must' : 'must_not'
    filter.bool[scheduledAtClause] = [
      ...(filter.bool[scheduledAtClause] || []),
      { exists: { field: 'meta.scheduledAt' } }
    ]
  }
  if (id !== undefined && id !== null) {
    const idClause = notId ? 'must_not' : 'must'
    filter.bool[idClause] = [
      ...(filter.bool[idClause] || []),
      { term: { id } }
    ]
  }
  return filter
}

const unpublish = async (elastic, repoId) => {
  return elastic.deleteByQuery({
    index: indexRef.index,
    conflicts: 'proceed',
    body: {
      query: {
        term: {
          'meta.repoId': repoId
        }
      }
    }
  })
}

const publish = (elastic, elasticDoc) => ({
  insert: async () => {
    const query = {
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        visibility: ['internal', 'external']
      }
    }
    // logQuery('index', query)
    return elastic.index(query)
  },
  after: async () => {
    const repoId = elasticDoc.meta.repoId
    await del(getFilter(['internal', 'external'], null, repoId, elasticDoc.id, true), elastic)
    await del(getFilter(['internal'], false, repoId, elasticDoc.id, true), elastic)
    await del(getFilter(['external'], false, repoId, elasticDoc.id, true), elastic)
  }
})

const prepublish = (elastic, elasticDoc) => ({
  insert: async () => {
    const query = {
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        visibility: ['internal']
      }
    }
    // logQuery('index', query)
    return elastic.index(query)
  },
  after: async () => {
    const repoId = elasticDoc.meta.repoId
    await del(getFilter(['internal'], null, repoId, elasticDoc.id, true), elastic)
    await removeVisibility(
      getFilter(['internal', 'external'], false, repoId),
      'internal',
      elastic
    )
  }
})

const publishScheduled = (elastic, elasticDoc) => ({
  insert: async () => {
    elasticDoc.meta.publishDate = undefined
    if (!elasticDoc.meta.scheduledAt) {
      throw new Error('missing body.meta.scheduledAt')
    }
    const query = {
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        visibility: ['internal', 'external']
      }
    }
    // logQuery('index', query)
    return elastic.index(query)
  },
  after: async () => {
    const repoId = elasticDoc.meta.repoId
    await del(getFilter(['internal', 'external'], true, repoId), elastic)
    await del(getFilter(['internal'], true, repoId), elastic)
    await del(getFilter(['external'], true, repoId), elastic)
  },
  afterScheduled: async () => {
    await removeScheduledAt(
      getFilter(null, null, null, elasticDoc.id),
      elastic
    )
    await publish(elastic, elasticDoc).after()
  }
})

const prepublishScheduledAt = (elastic, elasticDoc) => ({
  insert: async () => {
    elasticDoc.meta.publishDate = undefined
    if (!elasticDoc.meta.scheduledAt) {
      throw new Error('missing body.meta.scheduledAt')
    }
    const query = {
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        visibility: ['internal']
      }
    }
    // logQuery('index', query)
    return elastic.index(query)
  },
  after: async () => {
    const repoId = elasticDoc.meta.repoId
    await del(getFilter(['external'], true, repoId), elastic)
  },
  afterScheduled: async () => {
    await removeScheduledAt(
      getFilter(null, null, null, elasticDoc.id),
      elastic
    )
    await prepublish(elastic, elasticDoc).after()
  }
})

const createPublish = ({prepublication, scheduledAt, elastic, elasticDoc}) => {
  // If scheduled is before now, it is safe to assume that a scheduled
  // document has been published already and does not need to be scheduled
  if (scheduledAt < new Date()) {
    scheduledAt = false
  }

  const func = prepublication
    ? scheduledAt
      ? prepublishScheduledAt
      : prepublish
    : scheduledAt
      ? publishScheduled
      : publish
  return func(elastic, elasticDoc)
}

module.exports = {
  schema,
  getElasticDoc,
  getRepoIdFromDocumentId,
  addRelatedDocs,
  unpublish,
  publish,
  prepublish,
  publishScheduled,
  prepublishScheduledAt,
  createPublish
}
