const {
  termEntry,
  countEntry
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

const schema = {
  type: termEntry('__type'),
  dossier: termEntry('meta.dossier'),
  format: termEntry('meta.format'),
  template: termEntry('meta.template'),
  repoId: termEntry('meta.repoId'),
  seriesMaster: termEntry('meta.seriesMaster'),
  userId: {
    ...termEntry('meta.credits.url'),
    parser: (value) => `/~${value}`
  },
  // path: {
  //  fieldPath: 'meta.path',
  //  criteriaBuilder: termCriteriaBuilder,
  //  aggBuilder: termAggBuilder
  // },
  publishedAt: {
    criteria: dateRangeCriteriaBuilder('meta.publishDate'),
    parser: (value) => {
      const [from, to] = value.split(',')
      return {
        from: new Date(from),
        to: new Date(to)
      }
    }
  },
  discussion: countEntry('meta.discussion'),
  feed: countEntry('meta.feed'),
  audio: countEntry('meta.audioSource.mp3'),
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

const {
  lib: { meta: { getStaticMeta } }
} = require('@orbiting/backend-modules-documents')
const mdastToString = require('mdast-util-to-string')
const { mdastFilter } = require('./utils.js')

const getElasticDoc = ({repoId, doc, versionNumber, prepublication, indexName, indexType}) => {
  const publicationType = prepublication
    ? 'prepublication'
    : 'publication'
  const scheduledAt = doc.content.meta.scheduledAt
    ? `/${doc.content.meta.scheduledAt.toISOString()}`
    : ''

  return {
    id: `${repoId}/${publicationType}${scheduledAt}`,
    index: indexName,
    type: indexType,
    version_type: 'external',
    version: versionNumber,
    body: {
      ...sanitizeCommitDocument(doc, indexType)
    }
  }
}

const sanitizeCommitDocument = (doc, indexType = 'Document') => {
  const meta = {
    ...doc.content.meta,
    ...getStaticMeta(doc)
  }
  const seriesMaster = typeof meta.series === 'string'
    ? meta.series
    : null
  const series = typeof meta.series === 'object'
    ? meta.series
    : null
  if (series) {
    series.episodes.forEach(e => {
      if (e.publishDate === '') {
        e.publishDate = null
      }
    })
  }

  return {
    // id: doc.id, // Buffer.from(`repo:${repoId}:${commitId}`).toString('base64')
    __type: indexType,
    __sort: {
      date: meta.publishDate
    },

    content: doc.content,
    contentString: mdastToString(
      mdastFilter(
        doc.content,
        node => node.type === 'code'
      )
    ),
    meta: {
      ...meta,
      repoId: doc.repoId,
      series,
      seriesMaster
    }
  }
}

module.exports = {
  schema,
  getElasticDoc
}
