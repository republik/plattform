module.exports = async (_, { search }, { user, elastic }) => {
  const result = await elastic.search({
    index: 'documents',
    type: 'document',
    body: createQuery(search)
  })

  const mapped = mapSearchResult(result)
  console.log(result)
  console.log(mapped)
  return mapped
}

function mapSearchResult (result) {
  return {
    nodes: result.hits.hits.map(mapDocumentHit),
    stats: mapStats(result.aggregations)
  }
}

function mapDocumentHit (hit) {
  return {
    document: hit._source,
    highlights: hit.highlight.contentString || [],
    score: hit._score
  }
}

function mapStats (aggregations) {
  return {
    formats: mapAggregation(aggregations.formats),
    podcasts: aggregations.podcasts.value,
    dossiers: mapAggregation(aggregations.dossiers),
    discussions: aggregations.discussions.value,
    seriesMasters: mapAggregation(aggregations.seriesMasters),
    authors: mapAggregation(aggregations.authors)
  }
}

function mapAggregation (aggregation) {
  return {
    buckets: aggregation.buckets.map(mapBucket)
  }
}

function mapBucket (bucket) {
  return {
    key: bucket.key,
    count: bucket.doc_count
  }
}

function createQuery (searchTerm) {
  return {
    _source: ['meta.*', 'content'],
    query: {
      bool: {
        must: {
          multi_match: {
            query: searchTerm,
            fields: [
              'meta.title^3',
              'meta.description^2',
              'meta.authors^2',
              'contentString'
            ]
          }
        },
        filter: {
          bool: {
            must: [
              {
                range: {
                  'meta.publishDate': {
                    gte: '2018-01-01',
                    lte: '2018-02-03'
                  }
                }
              }
            ]
          }
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
      podcasts: {
        value_count: {
          field: 'meta.audioSource.mp3'
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
      }
    }
  }
}
