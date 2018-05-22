const type = 'Credential'

module.exports = {
  type,
  index: type.toLowerCase(),
  search: {
    termFields: {
      description: {}
    },
    filter: {
      bool: {
        must: [
          { term: { __type: type } },
          { term: { isListed: true } }
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
        createdAt: {
          type: 'date'
        },
        description: {
          type: 'text',
          analyzer: 'german'
        },
        id: {
          type: 'keyword'
        },
        isListed: {
          type: 'boolean'
        },
        updatedAt: {
          type: 'date'
        },
        userId: {
          type: 'keyword'
        },
        verified: {
          type: 'boolean'
        }
      }
    }
  }
}
