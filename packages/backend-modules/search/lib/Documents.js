const _ = require('lodash')
const debug = require('debug')('search:lib:Documents')
const isUUID = require('is-uuid')
const visit = require('unist-util-visit')
const sleep = require('await-sleep')

const {
  resolve: { extractUserUrl, getRepoId },
  meta: { getWordsPerMinute },
} = require('@orbiting/backend-modules-documents/lib')

const { termEntry, countEntry, dateRangeParser } = require('./schema')

const {
  rangeAggBuilder,
  valueCountAggBuilder,
  existsCountAggBuilder,
} = require('./aggregations')

const {
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder,
  hasCriteriaBuilder,
  termCriteriaBuilder,
} = require('./filters')

const createCache = require('./cache')

const { getIndexAlias, mdastContentToString } = require('./utils')

const {
  createPublish: createPublishDocumentZones,
  unpublish: unpublishDocumentZones,
} = require('./DocumentZones')

const SHORT_DURATION_MINS = 5
const MIDDLE_DURATION_MINS = 15
const LONG_DURATION_MINS = 30

// Seconds to wait for ElasticSearch to reindex update data
const REINDEX_AWAIT_SECS = 2

const { GITHUB_LOGIN, GITHUB_ORGS } = process.env

const indexType = 'Document'

const indexRef = {
  index: getIndexAlias(indexType.toLowerCase(), 'write'),
  type: indexType,
}

const getDocumentId = ({ repoId, commitId, versionName }) =>
  Buffer.from(`${repoId}/${commitId}/${versionName}`).toString('base64')

const getParsedDocumentId = (id) => {
  const base64Buffer = Buffer.from(id, 'base64')
  const isBase64 = base64Buffer.toString('base64') === id

  if (!isBase64) {
    // id is repoId
    const [org, repoName] = id.split('/')
    return {
      repoId: id,
      org,
      repoName,
    }
  }

  // decoded = <org>/<repoName>/<commitId>/<versionName>
  //                 ^^^^^^^^^^
  const decoded = base64Buffer.toString('utf8')

  const [org, repoName, commitId, versionName] = decoded.split('/')

  return {
    repoName,
    org,
    repoId: repoName && org && `${org}/${repoName}`,
    commitId,
    versionName,
  }
}

const documentIdParser = (value) => {
  const { repoName } = getParsedDocumentId(value)
  return getResourceUrls(repoName)
}

const documentIdsParser = (values) => {
  return values.reduce((all, value) => all.concat(documentIdParser(value)), [])
}

const getResourceUrls = (repoName) => {
  const orgs = GITHUB_ORGS ? GITHUB_ORGS.split(',') : []
  orgs.push(GITHUB_LOGIN)

  return orgs.map((org) => `https://github.com/${org}/${repoName}`)
}

const schema = {
  // special value to indicate this schemas index type
  __type: indexType,
  id: {
    criteria: termCriteriaBuilder('_id'),
  },
  ids: {
    criteria: termCriteriaBuilder('_id'),
  },
  type: termEntry('__type'),
  template: termEntry('meta.template'),
  dossier: {
    criteria: termCriteriaBuilder('meta.dossier'),
    agg: valueCountAggBuilder('meta.dossier'),
    parser: documentIdParser,
  },
  hasDossier: {
    criteria: hasCriteriaBuilder('meta.dossier'),
    agg: existsCountAggBuilder('meta.dossier'),
  },
  format: {
    criteria: termCriteriaBuilder('meta.format'),
    agg: valueCountAggBuilder('meta.format'),
    parser: documentIdParser,
  },
  formats: {
    criteria: termCriteriaBuilder('meta.format'),
    parser: documentIdsParser,
  },
  hasFormat: {
    criteria: hasCriteriaBuilder('meta.format'),
    agg: existsCountAggBuilder('meta.format'),
  },
  section: {
    criteria: termCriteriaBuilder('meta.section'),
    agg: valueCountAggBuilder('meta.section'),
    parser: documentIdParser,
  },
  hasSection: {
    criteria: hasCriteriaBuilder('meta.section'),
    agg: existsCountAggBuilder('meta.section'),
  },
  kind: termEntry('resolved.meta.format.meta.kind'),
  repoId: {
    criteria: termCriteriaBuilder('meta.repoId'),
  },
  repoIds: {
    criteria: termCriteriaBuilder('meta.repoId'),
  },
  path: {
    criteria: termCriteriaBuilder('meta.path.keyword'),
  },
  commitId: {
    criteria: termCriteriaBuilder('commitId'),
  },
  versionName: {
    criteria: termCriteriaBuilder('versionName'),
  },
  userId: {
    criteria: termCriteriaBuilder('meta.credits.url'),
    parser: (value) => `/~${value}`,
  },
  publishedAt: {
    criteria: dateRangeCriteriaBuilder('meta.publishDate'),
    parser: dateRangeParser,
  },
  scheduledAt: {
    criteria: dateRangeCriteriaBuilder('meta.scheduledAt'),
    parser: dateRangeParser,
  },
  feed: countEntry('meta.feed'),
  discussion: {
    criteria: termCriteriaBuilder('meta.discussionId'),
  },
  audioSource: {
    criteria: hasCriteriaBuilder('meta.audioSource'),
    agg: existsCountAggBuilder('meta.audioSource'),
  },
  audioSourceKind: termEntry('meta.audioSource.kind'),
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
          must: {
            exists: {
              field: 'contentString.count',
            },
          },
          must_not: {
            terms: {
              'meta.template': ['format', 'discussion'],
            },
          },
        },
      },
      ranges: [
        {
          key: 'short',
          to: getWordsPerMinute() * SHORT_DURATION_MINS,
        },
        {
          key: 'medium',
          from: getWordsPerMinute() * SHORT_DURATION_MINS,
          to: getWordsPerMinute() * MIDDLE_DURATION_MINS,
        },
        {
          key: 'long',
          from: getWordsPerMinute() * MIDDLE_DURATION_MINS,
          to: getWordsPerMinute() * LONG_DURATION_MINS,
        },
        {
          key: 'epic',
          from: getWordsPerMinute() * LONG_DURATION_MINS,
        },
      ],
    },
  },
}

const getElasticDoc = ({ doc, commitId, versionName, resolved }) => {
  const meta = doc.content.meta
  const id = getDocumentId({ repoId: meta.repoId, commitId, versionName })
  return {
    __type: indexType,
    __sort: {
      date: meta.publishDate,
    },
    id,
    commitId,
    versionName,
    meta, // doc.meta === doc.content.meta
    resolved: !_.isEmpty(resolved) ? resolved : undefined,
    content: doc.content,
    contentString: mdastContentToString(doc.content),
  }
}

const extractIdsFromNode = (haystack, contextRepoId) => {
  const repos = []
  const users = []
  visit(haystack, 'zone', (node) => {
    if (node.data) {
      repos.push(getRepoId(node.data.url).repoId)
      repos.push(getRepoId(node.data.formatUrl).repoId)
    }
  })
  visit(haystack, 'link', (node) => {
    const info = extractUserUrl(node.url)
    if (info) {
      node.url = info.path
      if (isUUID.v4(info.id)) {
        users.push(info.id)
      } else {
        debug(
          'addRelatedDocs found nonUUID %s in repo %s',
          info.id,
          contextRepoId,
        )
      }
    }
    const { repoId } = getRepoId(node.url, 'autoSlug')
    if (repoId) {
      repos.push(repoId)
    }
  })
  return {
    repos: repos.filter(Boolean),
    users: users.filter(Boolean),
  }
}

const getDocsForConnection = (connection) =>
  connection.nodes
    .filter((node) => node.type === 'Document')
    .map((node) => node.entity)

const loadLinkedMetaData = async ({
  repoIds = [],
  userIds = [],
  context,
  scheduledAt,
  ignorePrepublished,
}) => {
  const usernames = !userIds.length
    ? []
    : await context.pgdb.public.users.find(
        {
          id: userIds,
          hasPublicProfile: true,
          'username !=': null,
        },
        {
          fields: ['id', 'username'],
        },
      )

  const search = require('../graphql/resolvers/_queries/search')
  const sanitizedRepoIds = [...new Set(repoIds.filter(Boolean))]
  const docs = !sanitizedRepoIds.length
    ? []
    : await search(
        null,
        {
          recursive: true,
          withoutContent: true,
          withoutAggs: true,
          withoutRelatedDocs: true,
          scheduledAt,
          ignorePrepublished,
          first: sanitizedRepoIds.length * 2,
          filter: {
            repoId: sanitizedRepoIds,
            type: 'Document',
          },
        },
        context,
      ).then(getDocsForConnection)

  return {
    usernames,
    docs,
  }
}

const addRelatedDocs = async ({
  connection,
  scheduledAt,
  ignorePrepublished,
  context,
  withoutContent,
}) => {
  const docs = getDocsForConnection(connection)

  // extract users and related repoIds (from content and meta)
  let userIds = []
  let repoIds = []
  const seriesRepoIds = []
  docs.forEach((doc) => {
    // from content
    if (!withoutContent) {
      const extractedIds = extractIdsFromNode(doc.content, doc.repoId)
      userIds = userIds.concat(extractedIds.users)
      repoIds = repoIds.concat(extractedIds.repos)
    } else {
      const extractedIds = extractIdsFromNode(
        { children: doc.meta.credits },
        doc.repoId,
      )
      userIds = userIds.concat(extractedIds.users)
      repoIds = repoIds.concat(extractedIds.repos)
    }
    // from meta
    const meta = doc.content.meta
    // TODO get keys from packages/documents/lib/resolve.js
    repoIds.push(getRepoId(meta.dossier).repoId)
    repoIds.push(getRepoId(meta.format).repoId)
    repoIds.push(getRepoId(meta.section).repoId)
    repoIds.push(getRepoId(meta.discussion).repoId)
    if (meta.series) {
      // If a string, probably a series master (tbc.)
      if (typeof meta.series === 'string') {
        const { repoId: seriesRepoId } = getRepoId(meta.series)
        if (seriesRepoId) {
          seriesRepoIds.push(seriesRepoId)
        }
      } else {
        meta.series.overview &&
          repoIds.push(getRepoId(meta.series.overview).repoId)
        meta.series.episodes?.forEach((episode) => {
          repoIds.push(getRepoId(episode.document).repoId)
        })
      }
    }
  })

  let relatedDocs = []

  // If there are any series master repositories, fetch these series master
  // documents and push series episodes onto the related docs stack
  if (seriesRepoIds.length) {
    const { docs: seriesRelatedDocs } = await loadLinkedMetaData({
      context,
      repoIds: seriesRepoIds,
      scheduledAt,
      ignorePrepublished,
    })

    relatedDocs = relatedDocs.concat(seriesRelatedDocs)

    seriesRelatedDocs.forEach((doc) => {
      const meta = doc.content.meta
      meta.series.overview &&
        repoIds.push(getRepoId(meta.series.overview).repoId)
      meta.series.episodes &&
        meta.series.episodes.forEach((episode) => {
          debug(getRepoId(episode.document).repoId)
          repoIds.push(getRepoId(episode.document).repoId)
        })
    })
  }

  const { docs: variousRelatedDocs, usernames } = await loadLinkedMetaData({
    context,
    repoIds,
    userIds,
    scheduledAt,
    ignorePrepublished,
  })

  relatedDocs = relatedDocs.concat(variousRelatedDocs)

  // resolve formats for all related docs
  const { docs: relatedFormatDocs } = await loadLinkedMetaData({
    context,
    repoIds: relatedDocs.map((d) => getRepoId(d.meta.format).repoId),
    scheduledAt,
    ignorePrepublished,
  })

  relatedDocs = relatedDocs.concat(relatedFormatDocs)

  debug({
    numDocs: docs.length,
    numUserIds: userIds.length,
    numRepoIds: repoIds.length,
    numRelatedDocs: relatedDocs.length,
  })

  // mutate docs
  docs.forEach((doc) => {
    // expose all documents to each document
    // for link resolving in lib/resolve
    // - including the usernames
    doc._all = [...(doc._all ? doc._all : []), ...relatedDocs, ...docs]
    doc._usernames = usernames
  })
}

const switchState = async function (elastic, state, repoId, docId) {
  debug('switchState', { state, repoId, docId })
  const queries = []
  const painless = []

  if (state.published === true || state.published === false) {
    queries.push({ term: { '__state.published': state.published } })
    painless.push('ctx._source.__state.published = params.state.published')
  }

  if (state.prepublished === true || state.prepublished === false) {
    queries.push({ term: { '__state.prepublished': state.prepublished } })
    painless.push(
      'ctx._source.__state.prepublished = params.state.prepublished',
    )
  }

  return elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [{ term: { 'meta.repoId': repoId } }],
          should: queries,
          must_not: [{ term: { _id: docId } }],
        },
      },
      script: {
        lang: 'painless',
        source: painless.join(';'),
        params: {
          state: {
            published: !state.published,
            prepublished: !state.prepublished,
          },
        },
      },
    },
  })
}

const resetScheduledAt = async function (
  elastic,
  isPrepublication,
  repoId,
  docId,
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
            { term: { 'meta.prepublication': isPrepublication } },
          ],
          must_not: [{ term: { _id: docId } }],
        },
      },
      script: {
        lang: 'painless',
        source: 'ctx._source.meta.scheduledAt = null',
      },
    },
  })
}

const unpublish = async (elastic, redis, repoId) => {
  await elastic.deleteByQuery({
    index: indexRef.index,
    conflicts: 'proceed',
    refresh: true,
    body: {
      query: {
        term: {
          'meta.repoId': repoId,
        },
      },
    },
  })

  await unpublishDocumentZones(elastic, repoId)

  await sleep(1000 * REINDEX_AWAIT_SECS)
  await createCache(redis).invalidate()
}

const publish = (elastic, redis, elasticDoc, hasPrepublication) => {
  const zones = createPublishDocumentZones(elastic, elasticDoc)

  return {
    insert: async () => {
      elasticDoc.meta.scheduledAt = undefined
      await elastic.index({
        ...indexRef,
        id: elasticDoc.id,
        body: {
          ...elasticDoc,
          __state: {
            published: true,
            prepublished: !hasPrepublication,
          },
        },
      })
    },
    after: async () => {
      await switchState(
        elastic,
        { published: true, prepublished: true },
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await resetScheduledAt(
        elastic,
        false,
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.insert({ published: true, prepublished: true })
      await zones.after({ published: true, prepublished: true })

      await sleep(1000 * REINDEX_AWAIT_SECS)
      await createCache(redis).invalidate()
    },
  }
}

const prepublish = (elastic, redis, elasticDoc) => {
  const zones = createPublishDocumentZones(elastic, elasticDoc)

  return {
    insert: async () => {
      elasticDoc.meta.scheduledAt = undefined
      await elastic.index({
        ...indexRef,
        id: elasticDoc.id,
        body: {
          ...elasticDoc,
          __state: {
            published: false,
            prepublished: true,
          },
        },
      })
    },
    after: async () => {
      await switchState(
        elastic,
        { prepublished: true },
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await resetScheduledAt(
        elastic,
        true,
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.insert({ prepublished: true })
      await zones.after({ prepublished: true })

      await sleep(1000 * REINDEX_AWAIT_SECS)
      await createCache(redis).invalidate()
    },
  }
}

const publishScheduled = (elastic, redis, elasticDoc) => {
  const zones = createPublishDocumentZones(elastic, elasticDoc)

  return {
    insert: async () => {
      if (!elasticDoc.meta.scheduledAt) {
        throw new Error('missing body.meta.scheduledAt')
      }

      await elastic.index({
        ...indexRef,
        id: elasticDoc.id,
        body: {
          ...elasticDoc,
          __state: {
            published: false,
            prepublished: false,
          },
        },
      })
    },
    after: async () => {
      await resetScheduledAt(
        elastic,
        false,
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.insert()
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
              prepublished: true,
            },
          },
        },
      })

      await switchState(
        elastic,
        { published: true, prepublished: true },
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.after({ published: true, prepublished: true })

      await sleep(1000 * REINDEX_AWAIT_SECS)
      await createCache(redis).invalidate()
    },
  }
}

const prepublishScheduled = (elastic, redis, elasticDoc) => {
  const zones = createPublishDocumentZones(elastic, elasticDoc)

  return {
    insert: async () => {
      if (!elasticDoc.meta.scheduledAt) {
        throw new Error('missing body.meta.scheduledAt')
      }

      await elastic.index({
        ...indexRef,
        id: elasticDoc.id,
        body: {
          ...elasticDoc,
          __state: {
            published: false,
            prepublished: false,
          },
        },
      })
    },
    after: async () => {
      await resetScheduledAt(
        elastic,
        true,
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.insert()
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
              prepublished: true,
            },
          },
        },
      })

      await switchState(
        elastic,
        { prepublished: true },
        elasticDoc.meta.repoId,
        elasticDoc.id,
      )

      await zones.after({ prepublished: true })

      await sleep(1000 * REINDEX_AWAIT_SECS)
      await createCache(redis).invalidate()
    },
  }
}

const createPublish = ({
  prepublication,
  scheduledAt,
  hasPrepublication,
  elasticDoc,
  elastic,
  redis,
}) => {
  debug('createPublish', elasticDoc.meta.repoId, {
    prepublication,
    scheduledAt,
    hasPrepublication,
  })
  const func = prepublication
    ? scheduledAt
      ? prepublishScheduled
      : prepublish
    : scheduledAt
    ? publishScheduled
    : publish
  return func(elastic, redis, elasticDoc, hasPrepublication)
}

const isPathUsed = async function (elastic, path, repoId) {
  const { body } = await elastic.search({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: { term: { 'meta.path.keyword': path } },
          should: [
            { term: { '__state.published': true } },
            { term: { '__state.prepublished': true } },
            { exists: { field: 'meta.scheduledAt' } },
          ],
          must_not: { term: { 'meta.repoId': repoId } },
        },
      },
    },
  })

  const total = body.hits.total
  const totalCount = Number.isFinite(total?.value) ? total.value : total

  debug('isPathUsed', { path, repoId, totalCount })

  return totalCount > 0
}

/**
 * Return all publications for a given repo ID, stored in ElasticSearch.
 */
const findPublications = async function (elastic, repoId) {
  const { body } = await elastic.search({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: [
            { term: { 'meta.repoId': repoId } },
            { term: { 'meta.prepublication': false } },
          ],
        },
      },
    },
  })

  return body.hits.hits.map((hit) => hit._source)
}

/**
 * Return published and scheduled publications for a given repo ID, store
 * in ElasticSearch.
 */
const findPublished = async function (elastic, repoId) {
  const { body } = await elastic.search({
    ...indexRef,
    body: {
      query: {
        bool: {
          must: [
            { term: { 'meta.repoId': repoId } },
            {
              bool: {
                should: [
                  { term: { '__state.published': true } },
                  {
                    bool: {
                      must: [
                        { term: { 'meta.prepublication': false } },
                        { exists: { field: 'meta.scheduledAt' } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  })

  return body.hits.hits.map((hit) => hit._source)
}

const findTemplates = async function (elastic, template, repoId) {
  const filter = repoId
    ? { term: { 'meta.repoId': repoId.split('/').slice(-2).join('/') } }
    : { term: { 'meta.template': template } }

  const { body } = await elastic.search({
    ...indexRef,
    size: 10000,
    body: {
      _source: [
        'meta.repoId',
        'meta.title',
        'meta.description',
        'meta.kind',
        'meta.template',
      ],
      query: {
        bool: {
          must: {
            match_all: {},
          },
          filter,
        },
      },
    },
  })

  debug('findTemplates', { template, repoId, filter, total: body.hits.total })

  return body.hits.hits.map((hit) => hit._source)
}

module.exports = {
  SHORT_DURATION_MINS,
  MIDDLE_DURATION_MINS,
  LONG_DURATION_MINS,
  schema,
  getElasticDoc,
  extractIdsFromNode,
  loadLinkedMetaData,
  addRelatedDocs,
  unpublish,
  publish,
  prepublish,
  publishScheduled,
  prepublishScheduled,
  createPublish,
  isPathUsed,
  findPublications,
  findPublished,
  findTemplates,
  getResourceUrls,
  getDocumentId,
  getParsedDocumentId,
}
