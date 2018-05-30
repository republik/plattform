const debug = require('debug')('search:lib:Documents')
const {
  termEntry,
  countEntry,
  dateRangeParser
} = require('./schema')

const {
  rangeAggBuilder
} = require('./aggregations')

const {
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder
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
  dossier: {
    ...termEntry('meta.dossier'),
    parser: documentIdParser
  },
  format: {
    ...termEntry('meta.format'),
    parser: documentIdParser
  },
  template: termEntry('meta.template'),
  repoId: termEntry('meta.repoId'),
  path: termEntry('meta.path.keyword'),
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
  discussion: countEntry('meta.discussion'),
  feed: countEntry('meta.feed'),
  audioSource: countEntry('meta.audioSource'),
  hasAudio: countEntry('meta.hasAudio'),
  hasVideo: countEntry('meta.hasVideo'),
  isSeriesMaster: countEntry('meta.isSeriesMaster'),
  isSeriesEpisode: countEntry('meta.isSeriesEpisode'),
  textLength: {
    criteria: rangeCriteriaBuilder('contentString.count'),
    agg: rangeAggBuilder('contentString.count'),
    options: {
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

const getElasticDoc = ({ indexName, indexType, doc, commitId, versionName }) => {
  const meta = doc.content.meta
  const id = getDocumentId({repoId: meta.repoId, commitId, versionName})
  return {
    id,
    index: indexName,
    type: indexType,
    body: {
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

  const relatedDocs = await search(null, {
    skipLoadRelatedDocs: true,
    filter: {
      repoId: [...new Set(repoIds.filter(Boolean))],
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

module.exports = {
  schema,
  getElasticDoc,
  getRepoIdFromDocumentId,
  addRelatedDocs
}
