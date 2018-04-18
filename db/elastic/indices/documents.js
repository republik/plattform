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

module.exports = {
  aliases: {},
  mappings: {
    document: {
      dynamic: false,
      properties: {
        contentString: {
          type: 'text',
          analyzer: 'german'
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
            seriesMaster: {
              type: 'keyword'
            },
            series: {
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
