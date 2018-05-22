module.exports = {
  Credential: {
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
