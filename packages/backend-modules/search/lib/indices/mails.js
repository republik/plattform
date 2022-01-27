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
              normalizer: 'to_lowercase',
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
  analysis: {
    normalizer: {
      to_lowercase: {
        type: 'custom',
        char_filter: [],
        filter: ['lowercase'],
      },
    },
  },
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
