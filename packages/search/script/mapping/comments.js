module.exports = {
  Comment: {
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
        analyzer: 'german'
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
