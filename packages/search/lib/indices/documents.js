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

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      'meta.title': {
        boost: 3,
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
      'meta.authors': {
        boost: 2,
        highlight: {
          number_of_fragments: 0
        }
      },
      contentString: {
        highlight: {}
      },
      content: {
        highlight: {}
      },
      '__format.title.keyword': {
        boost: 6
      },
      '__format.description': {}
    },
    filter: {
      bool: {
        must: [
          { term: { __type: type } }
        ],
        // return all editorialNewsletters with feed:true or everything
        // that is not editorialNewsletters. Brainfuck.
        should: [
          { bool: { must: [
            { term: { 'meta.template': 'editorialNewsletter' } },
            { term: { 'meta.feed': true } }
          ] } },
          { bool: { must_not: [
            { term: { 'meta.template': 'editorialNewsletter' } }
          ] } }
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
        __sort: {
          properties: {
            date: {
              type: 'date'
            }
          }
        },
        __format: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'german',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256
                }
              }
            },
            description: {
              type: 'text',
              analyzer: 'german'
            }
          }
        },

        contentString: {
          type: 'text',
          analyzer: 'german',
          fielddata: true,
          fields: {
            count: {
              type: 'token_count',
              analyzer: 'standard'
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
            description: {
              type: 'text',
              analyzer: 'german'
            },
            publishDate: {
              type: 'date'
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
              type: 'keyword'
            },
            isSeriesEpisode: {
              type: 'keyword'
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
