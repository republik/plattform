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

const { GITHUB_LOGIN, GITHUB_ORGS } = process.env

const getDocumentId = ({repoId, commitId, versionName}) =>
  Buffer.from(`${repoId}/${commitId}/${versionName}`).toString('base64')

const documentIdParser = value => {
  const decoded = Buffer.from(value, 'base64').toString('utf8')

  // decoded = <org>/<repoName>/<commitId>/<versionName>
  //                 ^^^^^^^^^^
  const repoName = decoded.split('/').slice(1, 2)

  return getResourceUrls(repoName)
}

const getResourceUrls = repoName => {
  const orgs = GITHUB_ORGS ? GITHUB_ORGS.split(',') : []
  orgs.push(GITHUB_LOGIN)

  return orgs.map(org => `https://github.com/${org}/${repoName}`)
}

const schema = {
  type: termEntry('__type'),
  state: termEntry('__state'),
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

const getElasticDoc = (
  { doc, commitId, versionName, milestoneCommitId, resolved }
) => {
  const meta = doc.content.meta
  const id = getDocumentId({repoId: meta.repoId, commitId, versionName})
  return {
    __type: indexType,
    __sort: {
      date: meta.publishDate
    },
    resolved,
    id,
    commitId,
    versionName,
    milestoneCommitId,
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
    visit(doc.content, 'zone', node => {
      if (node.data) {
        repoIds.push(getRepoId(node.data.url))
        repoIds.push(getRepoId(node.data.formatUrl))
      }
    })
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
  debug({
    numDocs: docs.length,
    numUserIds: userIds.length,
    numRepoIds: repoIds.length,
    numRelatedDocs: relatedDocs.length
  })

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

const switchState = async function (elastic, state, repoId, docId) {
  debug('switchState', { state, repoId, docId })
  const queries = []
  const painless = []

  if (state.published === true || state.published === false) {
    queries.push({ term: { '__state.published': state.published } })
    painless.push(
      'ctx._source.__state.published = params.state.published'
    )
  }

  if (state.prepublished === true || state.prepublished === false) {
    queries.push({ term: { '__state.prepublished': state.prepublished } })
    painless.push(
      'ctx._source.__state.prepublished = params.state.prepublished'
    )
  }

  return elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [
            { term: { 'meta.repoId': repoId } }
          ],
          should: queries,
          must_not: [
            { term: { '_id': docId } }
          ]
        }
      },
      script: {
        lang: 'painless',
        source: painless.join(';'),
        params: {
          state: {
            published: !state.published,
            prepublished: !state.prepublished
          }
        }
      }
    }
  })
}

const resetScheduledAt = async function (
  elastic, isPrepublication, repoId, docId
) {
  debug('resetScheduledAt', { isPrepublication, repoId, docId })

  return elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [
            { term: { 'meta.repoId': repoId } },
            { term: { 'meta.prepublication': isPrepublication } }
          ],
          must_not: [
            { term: { '_id': docId } }
          ]
        }
      },
      script: {
        lang: 'painless',
        source: 'ctx._source.meta.scheduledAt = null'
      }
    }
  })
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

const publish = (elastic, elasticDoc, hasPrepublication) => ({
  insert: async () => {
    elasticDoc.meta.scheduledAt = undefined
    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: {
          published: true,
          prepublished: !hasPrepublication
        }
      }
    })
  },
  after: async () => {
    await switchState(
      elastic,
      { published: true, prepublished: true },
      elasticDoc.meta.repoId,
      elasticDoc.id
    )

    await resetScheduledAt(
      elastic,
      false,
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  }
})

const prepublish = (elastic, elasticDoc) => ({
  insert: async () => {
    elasticDoc.meta.scheduledAt = undefined
    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: {
          published: false,
          prepublished: true
        }
      }
    })
  },
  after: async () => {
    await switchState(
      elastic,
      { prepublished: true },
      elasticDoc.meta.repoId,
      elasticDoc.id
    )

    await resetScheduledAt(
      elastic,
      true,
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  }
})

const publishScheduled = (elastic, elasticDoc) => ({
  insert: async () => {
    if (!elasticDoc.meta.scheduledAt) {
      throw new Error('missing body.meta.scheduledAt')
    }

    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: {
          published: false,
          prepublished: false
        }
      }
    })
  },
  after: async () => {
    await resetScheduledAt(
      elastic,
      false,
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  },
  afterScheduled: async () => {
    await elastic.update({
      ...indexRef,
      id: elasticDoc.id,
      refresh: true,
      body: {
        doc: {
          meta: { scheduledAt: null },
          __state: {
            published: true,
            prepublished: true
          }
        }
      }
    })

    await switchState(
      elastic,
      { published: true, prepublished: true },
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  }
})

const prepublishScheduled = (elastic, elasticDoc) => ({
  insert: async () => {
    if (!elasticDoc.meta.scheduledAt) {
      throw new Error('missing body.meta.scheduledAt')
    }

    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: {
          published: false,
          prepublished: false
        }
      }
    })
  },
  after: async () => {
    await resetScheduledAt(
      elastic,
      true,
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  },
  afterScheduled: async () => {
    await elastic.update({
      ...indexRef,
      id: elasticDoc.id,
      refresh: true,
      body: {
        doc: {
          meta: { scheduledAt: null },
          __state: {
            published: false,
            prepublished: true
          }
        }
      }
    })

    await switchState(
      elastic,
      { prepublished: true },
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  }
})

const createPublish = ({
  prepublication,
  scheduledAt,
  hasPrepublication,
  elastic,
  elasticDoc
}) => {
  debug('createPublish', elasticDoc.meta.repoId, {
    prepublication,
    scheduledAt,
    hasPrepublication
  })
  const func = prepublication
    ? scheduledAt
      ? prepublishScheduled
      : prepublish
    : scheduledAt
      ? publishScheduled
      : publish
  return func(elastic, elasticDoc, hasPrepublication)
}

const isPathUsed = async function (elastic, path, repoId) {
  const response = await elastic.search({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: { term: { 'meta.path.keyword': path } },
          should: [
            { term: { '__state.published': true } },
            { term: { '__state.prepublished': true } },
            { exists: { field: 'meta.scheduledAt' } }
          ],
          must_not: { term: { 'meta.repoId': repoId } }
        }
      }
    }
  })

  debug('findUsedPath', { path, repoId, total: response.hits.total })

  return !!response.hits.total
}

const findPublished = async function (elastic, repoId) {
  const response = await elastic.search({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: [
            { term: { 'meta.repoId': repoId } },
            { bool: { should: [
              { term: { '__state.published': true } },
              { bool: { must: [
                { term: { 'meta.prepublication': false } },
                { exists: { field: 'meta.scheduledAt' } }
              ] } }
            ] } }
          ]
        }
      }
    }
  })

  return response.hits.hits.map(hit => hit._source)
}

const findTemplates = async function (elastic, template, repoId) {
  const filter = repoId
    ? { term: { 'meta.repoId': repoId.split('/').slice(-2).join('/') } }
    : { term: { 'meta.template': template } }

  const response = await elastic.search({
    ...indexRef,
    size: 10000,
    body: {
      _source: [
        'meta.repoId',
        'meta.title',
        'meta.description',
        'meta.kind',
        'meta.template'
      ],
      query: {
        bool: {
          must: {
            match_all: {}
          },
          filter
        }
      }
    }
  })

  debug(
    'findTemplates',
    { template, repoId, filter, total: response.hits.total }
  )

  return response.hits.hits.map(hit => hit._source)
}

module.exports = {
  schema,
  getElasticDoc,
  addRelatedDocs,
  unpublish,
  publish,
  prepublish,
  publishScheduled,
  prepublishScheduled,
  createPublish,
  isPathUsed,
  findPublished,
  findTemplates,
  getResourceUrls
}
