const type = 'Mail'

const address = {
  properties: {
    value: {
      properties: {
        address: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
              normalizer: 'lowercase',
            },
          },
        },
        name: {
          type: 'text',
          analyzer: 'german',
        },
      },
    },
  },
}

module.exports = {
  type,
  name: type.toLowerCase(),
  searchable: false,
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        date: { type: 'date' },
        from: { ...address },
        to: { ...address },
        cc: { ...address },
        bcc: { ...address },
      },
    },
  },
}
