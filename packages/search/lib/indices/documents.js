const { meta: { getWordsPerMinute } } = require('@orbiting/backend-modules-documents/lib')
const { MIDDLE_DURATION_MINS } = require('../Documents')

const keywordPartial = {
  fields: {
    keyword: {
      type: 'keyword',
      ignore_above: 256
    }
  }
}

const mdastPartial = {
  properties: {
    type: {
      type: 'keyword'
    },
    value: {
      type: 'keyword'
    },
    url: {
      type: 'keyword'
    },
    children: { // is actually mdast again
      type: 'object'
    }
  }
}

const type = 'Document'

const { PREVIEW_MAIL_REPO_ID } = process.env

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      'meta.title': {
        boost: 2,
        highlight: {
          number_of_fragments: 0
        }
      },
      'meta.shortTitle': {
        boost: 2,
        highlight: {
          number_of_fragments: 0
        }
      },
      'meta.description': {
        boost: 2,
        highlight: {
          number_of_fragments: 0
        }
      },
      'meta.creditsString': {
        boost: 3
      },
      contentString: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300
        }
      },
      'resolved.meta.dossier.meta.title': {
        boost: 3
      },
      'resolved.meta.format.meta.title': {
        boost: 3
      },
      'resolved.meta.section.meta.title': {
        boost: 3
      }
    },
    functionScore: (query) => ({
      query,
      functions: [
        {
          filter: {
            terms: {
              'meta.template': ['format', 'section', 'dossier']
            }
          },
          weight: 20
        },
        {
          filter: {
            match: {
              'meta.isSeriesMaster': true
            }
          },
          weight: 20
        },
        {
          filter: {
            match: {
              'meta.isSeriesEpisode': true
            }
          },
          weight: 10
        },
        {
          filter: {
            range: {
              'contentString.count': {
                gte: getWordsPerMinute() * MIDDLE_DURATION_MINS
              }
            }
          },
          weight: 5
        },
        {
          filter: {
            match: {
              'meta.template': 'editorialNewsletter'
            }
          },
          weight: 0.1
        }
      ]
    }),
    filter: {
      default: () => {
        const filter = {
          bool: {
            must: [
              { term: { __type: type } }
            ],
            // return all editorialNewsletters with feed:true or everything
            // that is not editorialNewsletters. Brainfuck.
            should: [
              {
                bool: {
                  must: [
                    { term: { 'meta.template': 'editorialNewsletter' } },
                    { term: { 'meta.feed': true } }
                  ]
                }
              },
              {
                bool: {
                  must_not: [
                    { term: { 'meta.template': 'editorialNewsletter' } }
                  ]
                }
              }
            ]
          }
        }

        if (PREVIEW_MAIL_REPO_ID) {
          // Allow repo w/ preview email to be retrieved nomatter other filter
          filter.bool.should.push({
            bool: {
              must: [
                { term: { 'meta.repoId': PREVIEW_MAIL_REPO_ID } }
              ]
            }
          })
        }
      }
    },
    rolebasedFilter: {
      // Default filter
      default: () => ({
        bool: {
          must: [
            { term: { '__state.published': true } }
          ]
        }
      }),

      // Adopted filter when role "editor" is present
      editor: ({ scheduledAt, ignorePrepublished, id, ids } = {}) => {
        const should = [
          {
            bool: {
              must: [
                { term: { '__state.published': true } },
                { term: { '__state.prepublished': true } }
              ]
            }
          }
        ]

        if (scheduledAt) {
          const must = [
            { term: { 'meta.prepublication': false } }
          ]
          // scheduledAt can be date or a filter object
          // date: filter lower or equal
          // filter: ignore, is added to query in createShould
          if (!scheduledAt.from && !scheduledAt.to) {
            must.push(
              { range: { 'meta.scheduledAt': { lte: scheduledAt } } }
            )
          }
          should.push({ bool: { must } })
        }

        if (!ignorePrepublished) {
          should.push({
            bool: {
              must: [
                { term: { '__state.published': false } },
                { term: { '__state.prepublished': true } }
              ]
            }
          })
        }

        if (id) {
          should.push({
            bool: {
              must: [
                { term: { _id: id } }
              ]
            }
          })
        }

        if (ids) {
          should.push({
            bool: {
              must: [
                { terms: { _id: ids } }
              ]
            }
          })
        }

        return {
          bool: {
            must: [
              { bool: { should } }
            ]
          }
        }
      }
    }
  },
  analysis: {
    normalizer: {
      republik_strict: {
        type: 'custom',
        filter: [
          'german_normalization',
          'lowercase',
          'asciifolding'
        ]
      }
    }
  },
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        __type: {
          type: 'keyword'
        },
        __state: {
          properties: {
            published: {
              type: 'boolean'
            },
            prepublished: {
              type: 'boolean'
            }
          }
        },
        __sort: {
          properties: {
            date: {
              type: 'date'
            }
          }
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
                          analyzer: 'german',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              normalizer: 'republik_strict',
                              ignore_above: 256
                            }
                          }
                        },
                        description: {
                          type: 'text',
                          analyzer: 'german'
                        },
                        kind: {
                          type: 'keyword'
                        },
                        template: {
                          type: 'keyword'
                        }
                      }
                    }
                  }
                },
                format: {
                  properties: {
                    meta: {
                      properties: {
                        title: {
                          type: 'text',
                          analyzer: 'german',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              normalizer: 'republik_strict',
                              ignore_above: 256
                            }
                          }
                        },
                        description: {
                          type: 'text',
                          analyzer: 'german'
                        },
                        kind: {
                          type: 'keyword'
                        },
                        template: {
                          type: 'keyword'
                        }
                      }
                    }
                  }
                },
                dossier: {
                  properties: {
                    meta: {
                      properties: {
                        title: {
                          type: 'text',
                          analyzer: 'german',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              normalizer: 'republik_strict',
                              ignore_above: 256
                            }
                          }
                        },
                        description: {
                          type: 'text',
                          analyzer: 'german'
                        },
                        kind: {
                          type: 'keyword'
                        },
                        template: {
                          type: 'keyword'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        commitId: {
          type: 'keyword'
        },
        versionName: {
          type: 'keyword'
        },
        milestoneCommitId: {
          type: 'keyword'
        },

        contentString: {
          type: 'text',
          analyzer: 'german',
          fielddata: true,
          fields: {
            count: {
              type: 'token_count',
              analyzer: 'standard',
              store: true
            },
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        content: {
          type: 'object',
          dynamic: false,
          enabled: false
        },

        meta: {
          properties: {
            repoId: {
              type: 'keyword'
            },
            title: {
              type: 'text',
              analyzer: 'german'
            },
            shortTitle: {
              type: 'text',
              analyzer: 'german'
            },
            description: {
              type: 'text',
              analyzer: 'german'
            },
            publishDate: {
              type: 'date'
            },
            lastPublishedAt: {
              type: 'date'
            },
            scheduledAt: {
              type: 'date'
            },
            prepublication: {
              type: 'boolean'
            },
            slug: {
              type: 'text',
              ...keywordPartial,
              analyzer: 'german'
            },
            path: {
              type: 'text',
              ...keywordPartial
            },
            feed: {
              type: 'boolean'
            },
            creditsString: {
              type: 'text',
              analyzer: 'german'
            },
            credits: {
              ...mdastPartial
            },
            authors: {
              type: 'text',
              ...keywordPartial,
              analyzer: 'german'
            },
            dossier: {
              type: 'keyword'
            },
            format: {
              type: 'keyword'
            },
            section: {
              type: 'keyword'
            },
            kind: {
              type: 'keyword'
            },
            template: {
              type: 'keyword'
            },
            discussionId: {
              type: 'keyword'
            },
            // series <- not indexed, inconsistent types
            isSeriesMaster: {
              type: 'boolean'
            },
            isSeriesEpisode: {
              type: 'boolean'
            },
            seriesEpisodes: {
              properties: {
                episodes: {
                  properties: {
                    document: {
                      type: 'keyword'
                    },
                    image: {
                      type: 'keyword'
                    },
                    label: {
                      type: 'text',
                      ...keywordPartial
                    },
                    publishDate: {
                      type: 'date'
                    },
                    title: {
                      type: 'text',
                      ...keywordPartial
                    }
                  }
                },
                title: {
                  type: 'text',
                  ...keywordPartial
                }
              }
            },
            hasAudio: {
              type: 'boolean'
            },
            hasVideo: {
              type: 'boolean'
            },
            audioSource: {
              properties: {
                mp3: {
                  type: 'keyword'
                },
                aac: {
                  type: 'keyword'
                },
                ogg: {
                  type: 'keyword'
                }
              }
            },
            color: {
              type: 'keyword'
            }
          }
        }
      }
    }
  }
}
