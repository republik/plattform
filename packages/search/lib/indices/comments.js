const type = 'Comment'

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      contentString: {
        boost: 0.5,
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300
        }
      },
      'resolved.user.name': {
        highlight: {
          number_of_fragments: 0
        }
      }
    },
    filter: {
      default: () => ({
        bool: {
          must: [
            { term: { __type: type } },
            { term: { published: true } },
            { term: { adminUnpublished: false } },
            { term: { 'resolved.discussion.hidden': false } }
          ]
        }
      })
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
        resolved: {
          properties: {
            user: {
              properties: {
                facebookId: {
                  type: 'keyword'
                },
                firstName: {
                  type: 'text'
                },
                lastName: {
                  type: 'text'
                },
                name: {
                  type: 'text'
                },
                credential: {
                  type: 'text',
                  analyzer: 'german'
                },
                twitterHandle: {
                  type: 'keyword'
                },
                username: {
                  type: 'keyword'
                }
              }
            },
            discussion: {
              properties: {
                hidden: {
                  type: 'boolean'
                }
              }
            }
          }
        },
        discussionId: {
          type: 'keyword'
        },
        parentIds: {
          type: 'keyword'
        },
        userId: {
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
          type: 'text',
          analyzer: 'german',
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

        upVotes: {
          type: 'integer'
        },
        downVotes: {
          type: 'integer'
        },

        votes: {
          properties: {
            vote: {
              type: 'integer'
            },
            userid: {
              type: 'keyword'
            }
          }
        },
        hotness: {
          type: 'float'
        },
        depth: {
          type: 'integer'
        },

        published: {
          type: 'boolean'
        },
        adminUnpublished: {
          type: 'boolean'
        },
        createdAt: {
          type: 'date'
        },
        updatedAt: {
          type: 'date'
        }
      }
    }
  }
}
