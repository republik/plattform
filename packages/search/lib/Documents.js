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

const getElasticDoc = ({ doc, commitId, versionName, milestoneCommitId }) => {
  const meta = doc.content.meta
  const id = getDocumentId({repoId: meta.repoId, commitId, versionName})
  return {
    __type: indexType,
    __sort: {
      date: meta.publishDate
    },
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

const update = async function (elastic, states, repoId, docId) {
  return elastic.updateByQuery({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: [
            { terms: { __state: states } },
            { term: { 'meta.repoId': repoId } }
          ],
          must_not: [
            { term: { id: docId } }
          ]
        }
      },
      script: {
        lang: 'painless',
        source: 'ctx._source.__state = params.state',
        params: {
          state: null
        }
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

const publish = (elastic, elasticDoc) => ({
  insert: async () => {
    elasticDoc.meta.scheduledAt = undefined
    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: 'published'
      }
    })
  },
  after: async () => update(
    elastic,
    ['published', 'prepublished'],
    elasticDoc.meta.repoId,
    elasticDoc.id
  )
})

const prepublish = (elastic, elasticDoc) => ({
  insert: async () => {
    elasticDoc.meta.scheduledAt = undefined
    return elastic.index({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        ...elasticDoc,
        __state: 'prepublished'
      }
    })
  },
  after: async () => update(
    elastic,
    ['prepublished'],
    elasticDoc.meta.repoId,
    elasticDoc.id
  )
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
        __state: null
      }
    })
  },
  after: async () => true,
  afterScheduled: async () => {
    debug('publishScheduled.afterScheduled', elasticDoc.id)
    await elastic.update({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        doc: {
          meta: { scheduledAt: null },
          __state: 'published'
        }
      }
    })

    await update(
      elastic,
      ['published', 'prepublished'],
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
        __state: null
      }
    })
  },
  after: async () => true, // noop
  afterScheduled: async () => {
    debug('prepublishScheduled.afterScheduled', elasticDoc.id)
    await elastic.update({
      ...indexRef,
      id: elasticDoc.id,
      body: {
        doc: {
          meta: { scheduledAt: null },
          __state: 'prepublished'
        }
      }
    })

    await update(
      elastic,
      ['prepublished'],
      elasticDoc.meta.repoId,
      elasticDoc.id
    )
  }
})

const createPublish = ({
  prepublication,
  scheduledAt,
  elastic,
  elasticDoc
}) => {
  debug('createPublish', elasticDoc.meta.repoId, {
    prepublication,
    scheduledAt,
    elastic
  })
  const func = prepublication
    ? scheduledAt
      ? prepublishScheduled
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
  prepublishScheduled,
  createPublish
}
