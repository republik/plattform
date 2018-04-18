class TermCriteria {
  constructor (fieldName) {
    this.fieldName = fieldName
  }

  create (value) {
    return {
      clause: 'must',
      filter: {
        term: { [this.fieldName]: value }
      }
    }
  }
}

class HasCriteria {
  constructor (fieldName) {
    this.fieldName = fieldName
  }

  create (value) {
    return {
      clause: value ? 'must' : 'must_not',
      filter: {
        exists: {
          field: this.fieldName
        }
      }
    }
  }
}

class DateRangeCriteria {
  constructor (fieldName) {
    this.fieldName = fieldName
  }

  create (range) {
    return {
      clause: 'must',
      filter: {
        range: {
          [this.fieldName]: {
            gte: range.from,
            lte: range.to
          }
        }
      }
    }
  }
}

class BoolFilterBuilder {
  constructor (filterCriterias) {
    this.filterCriterias = filterCriterias
  }

  createFilter (filter) {
    if (!filter) {
      return {}
    }

    return Object.keys(filter).reduce((boolFilter, searchFilterFieldName) => {
      const filterValue = filter[searchFilterFieldName]
      const criteria = this.filterCriterias[searchFilterFieldName]
      if (!criteria) {
        throw new Error(`Missing filter criteria for filter field ${searchFilterFieldName}`)
      }

      const created = criteria.create(filterValue)
      boolFilter[created.clause] = [...(boolFilter[created.clause] || []), created.filter]
      return boolFilter
    }, {})
  }
}

const boolFilterBuilder = new BoolFilterBuilder({
  author: new TermCriteria('meta.authors.keyword'),
  dossier: new TermCriteria('meta.dossier'),
  format: new TermCriteria('meta.format'),
  seriesMaster: new TermCriteria('meta.seriesMaster'),
  audio: new HasCriteria('audio', 'meta.audioSource.mp3'),
  discussion: new HasCriteria('meta.discussionId'),
  published: new DateRangeCriteria('meta.publishDate')
})

const createQuery = (searchTerm, filter) => {
  return {
    _source: ['meta.*', 'content'],
    query: {
      bool: {
        must: searchTerm
          ? {
            multi_match: {
              query: searchTerm,
              fields: [
                'meta.title^3',
                'meta.description^2',
                'meta.authors^2',
                'contentString'
              ]
            }
          }
          : { match_all: {} },
        filter: {
          bool: boolFilterBuilder.createFilter(filter)
        }
      }
    },
    highlight: {
      fields: {
        contentString: {}
      }
    },
    aggs: {
      authors: {
        terms: {
          field: 'meta.authors.keyword'
        }
      },
      dossiers: {
        terms: {
          field: 'meta.dossier'
        }
      },
      formats: {
        terms: {
          field: 'meta.format'
        }
      },
      seriesMasters: {
        terms: {
          field: 'meta.seriesMaster'
        }
      },
      discussions: {
        value_count: {
          field: 'meta.discussionId'
        }
      },
      audios: {
        value_count: {
          field: 'meta.audioSource.mp3'
        }
      }
    }
  }
}

const mapDocumentHit = (hit) => {
  return {
    document: hit._source,
    highlights: (hit.highlight || {}).contentString || [],
    score: hit._score
  }
}

const mapStats = (result) => {
  const aggregations = result.aggregations
  return {
    total: result.hits.total,
    formats: mapAggregation(aggregations.formats),
    audios: aggregations.audios.value,
    dossiers: mapAggregation(aggregations.dossiers),
    discussions: aggregations.discussions.value,
    seriesMasters: mapAggregation(aggregations.seriesMasters),
    authors: mapAggregation(aggregations.authors)
  }
}

const mapAggregation = (aggregation) => {
  return {
    buckets: aggregation.buckets.map(mapBucket)
  }
}

const mapBucket = (bucket) => {
  return {
    key: bucket.key,
    count: bucket.doc_count
  }
}

const PAGE_SIZE = 10
module.exports = async (_, { search, page = 1, filter }, { user, elastic }) => {
  const result = await elastic.search({
    index: 'documents',
    type: 'document',
    from: (page - 1) * PAGE_SIZE,
    size: PAGE_SIZE,
    body: createQuery(search, filter)
  })

  return {
    nodes: result.hits.hits.map(mapDocumentHit),
    stats: mapStats(result),
    pageInfo: {
      startCursor: '1',
      hasPreviousPage: page > 1,
      hasNextPage: result.hits.total - page * PAGE_SIZE > 0,
      endCursor: Math.ceil(result.hits.total / PAGE_SIZE)
    }
  }
}
