const type = 'Answer'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'public.answers',
  searchable: false,
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        payload: {
          properties: {
            text: {
              type: 'text',
              analyzer: 'german',
            },
            value: {
              type: 'keyword',
            },
          },
        },
        resolved: {
          properties: {
            value: {
              properties: {
                ImageChoice: {
                  type: 'text',
                  analyzer: 'german',
                },
                Choice: {
                  type: 'text',
                  analyzer: 'german',
                },
                Text: {
                  type: 'text',
                  analyzer: 'german',
                },
              },
            },
            question: {
              properties: {
                text: {
                  type: 'text',
                  analyzer: 'german',
                },
              },
            },
          },
        },
      },
    },
  },
}
