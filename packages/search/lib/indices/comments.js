const type = 'Comment'

module.exports = {
  type,
  index: type.toLowerCase(),
  search: {
    termFields: {
      content: {
        highlight: {}
      },
      'user.firstName': {},
      'user.lastName': {},
      'user.name': {},
      'user.username': {},
      'user.twitterHandle': {},
      'user.facebookId': {}
    },
    filter: {
      bool: {
        must: [
          { term: { __type: type } },
          { term: { published: true } },
          { term: { adminUnpublished: false } }
        ],
        must_not: [
          { terms: { discussionId: [
            '3c625fe4-788f-44d5-ad5e-ac93bd9a6292' // Crowdfunding discussions
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
        },

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
            twitterHandle: {
              type: 'keyword'
            },
            username: {
              type: 'keyword'
            }
          }
        }
      }
    }
  }
}
