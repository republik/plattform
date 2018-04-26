const {
  termEntry,
  countEntry
} = require('./schema')

const {
  dateRangeCriteriaBuilder
} = require('./filters')

const schema = {
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
  audio: countEntry('meta.audioSource.mp3')
}

module.exports = {
  schema
}
