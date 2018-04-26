const {
  hasCriteriaBuilder,
  termCriteriaBuilder,
  dateRangeCriteriaBuilder
} = require('./filters')
const {
  termAggBuilder,
  valueCountAggBuilder
} = require('./aggregations')
const { buildSchema } = require('./schema')

// eslint-disable-next-line eqeqeq
const boolParser = (value) => value == true

const schema = {
  dossier: {
    fieldPath: 'meta.dossier',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder
  },
  format: {
    fieldPath: 'meta.format',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder
  },
  template: {
    fieldPath: 'meta.template',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder
  },
  userId: {
    fieldPath: 'meta.credits.url',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder,
    parser: (value) => `/~${value}`
  },
  // path: {
  //  fieldPath: 'meta.path',
  //  criteriaBuilder: termCriteriaBuilder,
  //  aggBuilder: termAggBuilder
  // },
  repoId: {
    fieldPath: 'meta.repoId',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder
  },
  publishedAt: {
    fieldPath: 'meta.publishDate',
    criteriaBuilder: dateRangeCriteriaBuilder,
    parser: (value) => {
      const [from, to] = value.split(',')
      return {
        from: new Date(from),
        to: new Date(to)
      }
    }
  },
  seriesMaster: {
    fieldPath: 'meta.seriesMaster',
    criteriaBuilder: termCriteriaBuilder,
    aggBuilder: termAggBuilder
  },
  discussion: {
    fieldPath: 'meta.discussion',
    criteriaBuilder: hasCriteriaBuilder,
    aggBuilder: valueCountAggBuilder,
    parser: boolParser
  },
  feed: {
    fieldPath: 'meta.feed',
    criteriaBuilder: hasCriteriaBuilder,
    aggBuilder: valueCountAggBuilder,
    parser: boolParser
  },
  audio: {
    fieldPath: 'meta.audioSource.mp3',
    criteria: hasCriteriaBuilder('meta.audioSource.mp3'),
    aggBuilder: valueCountAggBuilder,
    parser: boolParser
  }
}

module.exports = {
  schema: buildSchema(schema)
}
