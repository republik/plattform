const keywordPartial = {
  fields: {
    keyword: {
      type: 'keyword',
      ignore_above: 256,
    },
  },
}

const mdastPartial = {
  properties: {
    type: {
      type: 'keyword',
    },
    value: {
      type: 'keyword',
    },
    url: {
      type: 'keyword',
    },
    children: {
      // is actually mdast again
      type: 'object',
    },
  },
}

const type = 'Document'

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      'meta.title': {
        highlight: {
          number_of_fragments: 0,
        },
      },
      'meta.shortTitle': {
        highlight: {
          number_of_fragments: 0,
        },
      },
      'resolved.meta.dossier.meta.title': {},
      'resolved.meta.format.meta.title': {},
      'resolved.meta.section.meta.title': {},
      'meta.seriesEpisodes.title': {},
      'meta.description': {
        highlight: {
          number_of_fragments: 0,
        },
      },
      'meta.creditsString': { boost: 2 },
      contentString: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300,
        },
      },
    },
    functionScore: (query) => ({
      query,
      functions: [
        {
          // push primary templates
          filter: {
            terms: {
              'meta.template': ['article', 'format', 'dossier'],
            },
          },
          weight: 2,
        },
        {
          // decay, via "scale" reducing relative "weight" from 1 to 0.5
          linear: {
            '__sort.date': {
              offset: '90d',
              scale: '275d',
            },
          },
        },
      ],
    }),
    filter: {
      default: () => ({
        bool: {
          must: [{ term: { __type: type } }],
        },
      }),
    },
    rolebasedFilter: {
      // Default filter
      default: () => ({
        bool: {
          must: [{ term: { '__state.published': true } }],
        },
      }),

      // Adopted filter when role "editor" is present
      editor: ({ scheduledAt, ignorePrepublished, id, ids } = {}) => {
        const should = []
        
        if (ignorePrepublished) {
          // Filter documents which are published
          should.push({ term: { '__state.published': true } })
        } else {
          // Filter documents which should either be published or prepublished.
          should.push({
            bool: {
              should: [
                { term: { '__state.published': true } },
                { term: { '__state.prepublished': true } },
              ],
            },
          })
        }

        if (scheduledAt) {
          const must = [{ term: { 'meta.prepublication': false } }]
          // scheduledAt can be date or a filter object
          // date: filter lower or equal
          // filter: ignore, is added to query in createShould
          if (!scheduledAt.from && !scheduledAt.to) {
            must.push({ range: { 'meta.scheduledAt': { lte: scheduledAt } } })
          }
          should.push({ bool: { must } })
        }

        if (id) {
          should.push({
            bool: {
              must: [{ term: { _id: id } }],
            },
          })
        }

        if (ids) {
          should.push({
            bool: {
              must: [{ terms: { _id: ids } }],
            },
          })
        }

        return {
          bool: {
            must: [{ bool: { should } }],
          },
        }
      },
    },
  },
  analysis: {
    filter: {
      german_stemmer: {
        type: 'stemmer',
        language: 'light_german',
      },
    },
    analyzer: {
      german_with_stopwords: {
        // @see https://www.elastic.co/guide/en/elasticsearch/reference/6.8/analysis-lang-analyzer.html#german-analyzer
        tokenizer: 'standard',
        filter: ['lowercase', 'german_normalization', 'german_stemmer'],
      },
    },
  },
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        __type: {
          type: 'keyword',
        },
        __state: {
          properties: {
            published: {
              type: 'boolean',
            },
            prepublished: {
              type: 'boolean',
            },
          },
        },
        __sort: {
          properties: {
            date: {
              type: 'date',
            },
          },
        },
        resolved: {
          properties: {
            meta: {
              properties: {
                section: {
                  properties: {
                    meta: {
                      properties: {
                        title: {
                          type: 'text',
                          analyzer: 'german_with_stopwords',
                        },
                      },
                    },
                  },
                },
                format: {
                  properties: {
                    meta: {
                      properties: {
                        title: {
                          type: 'text',
                          analyzer: 'german_with_stopwords',
                        },
                        kind: {
                          type: 'keyword',
                        },
                      },
                    },
                  },
                },
                dossier: {
                  properties: {
                    meta: {
                      properties: {
                        title: {
                          type: 'text',
                          analyzer: 'german_with_stopwords',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        commitId: {
          type: 'keyword',
        },
        versionName: {
          type: 'keyword',
        },

        contentString: {
          type: 'text',
          analyzer: 'german',
          fielddata: true,
          fields: {
            count: {
              type: 'token_count',
              analyzer: 'standard',
              store: true,
            },
          },
        },

        meta: {
          properties: {
            repoId: {
              type: 'keyword',
            },
            title: {
              type: 'text',
              analyzer: 'german_with_stopwords',
            },
            shortTitle: {
              type: 'text',
              analyzer: 'german_with_stopwords',
            },
            description: {
              type: 'text',
              analyzer: 'german',
            },
            publishDate: {
              type: 'date',
            },
            scheduledAt: {
              type: 'date',
            },
            prepublication: {
              type: 'boolean',
            },
            path: {
              type: 'text',
              ...keywordPartial,
            },
            feed: {
              type: 'boolean',
            },
            creditsString: {
              type: 'text',
              analyzer: 'german_with_stopwords',
            },
            credits: {
              ...mdastPartial,
            },
            dossier: {
              type: 'keyword',
            },
            format: {
              type: 'keyword',
            },
            section: {
              type: 'keyword',
            },
            kind: {
              type: 'keyword',
            },
            template: {
              type: 'keyword',
            },
            discussionId: {
              type: 'keyword',
            },
            // series <- not indexed, inconsistent types
            isSeriesMaster: {
              type: 'boolean',
            },
            isSeriesEpisode: {
              type: 'boolean',
            },
            seriesEpisodes: {
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'german_with_stopwords',
                },
              },
            },
            hasAudio: {
              type: 'boolean',
            },
            hasVideo: {
              type: 'boolean',
            },
            audioSource: {
              properties: {
                mp3: {
                  type: 'keyword',
                },
                aac: {
                  type: 'keyword',
                },
                ogg: {
                  type: 'keyword',
                },
              },
            },
          },
        },
      },
    },
  },
}
