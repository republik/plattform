const type = 'Comment'

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      content: {
        highlight: {}
      },
      'resolved.user.firstName': {},
      'resolved.user.lastName': {},
      'resolved.user.name': {
        boost: 1.5
      },
      'resolved.user.credential': {},
      'resolved.user.username': {},
      'resolved.user.twitterHandle': {},
      'resolved.user.facebookId': {}
    },
    filter: {
      default: () => ({
        bool: {
          must: [
            { term: { __type: type } },
            { term: { published: true } },
            { term: { adminUnpublished: false } }
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
