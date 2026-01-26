const type = 'DocumentZone'

module.exports = {
  type,
  search: {
    termFields: {
      text: {
        highlight: {
          number_of_fragments: 0,
        },
      },
    },
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
      editor: ({ ignorePrepublished } = {}) => {
        const should = [
          // published
          {
            bool: {
              must: [
                { term: { '__state.published': true } },
                { term: { '__state.prepublished': true } },
              ],
            },
          },
        ]

        if (!ignorePrepublished) {
          should.push({
            bool: {
              must: [
                { term: { '__state.published': false } },
                { term: { '__state.prepublished': true } },
              ],
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
      repoId: {
        type: 'keyword',
      },
      commitId: {
        type: 'keyword',
      },
      versionName: {
        type: 'keyword',
      },
      identifier: {
        // CHART, FIGURE, ...
        type: 'keyword',
      },
      text: {
        // stringified(node)
        type: 'text',
        analyzer: 'german_with_stopwords',
      },
      data: {
        // node.data
        properties: {
          // CHART node.data.type
          type: {
            type: 'keyword',
          },
        },
      },
    },
  },
}
