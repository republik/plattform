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
        questionnaireId: {
          type: 'keyword',
        },
        questionId: {
          type: 'keyword',
        },
        userId: {
          type: 'keyword',
        },

        resolved: {
          properties: {
            value: {
              properties: {
                Choice: {
                  type: 'keyword',
                },
                Document: {
                  type: 'keyword',
                },
                Range: {
                  type: 'long',
                },
                Text: {
                  type: 'text',
                  analyzer: 'german',
                },
              },
            },
            submission: {
              properties: {
                id: {
                  type: 'keyword',
                },
                createdAt: {
                  type: 'date',
                },
              },
            },
          },
        },
      },
    },
  },
}
