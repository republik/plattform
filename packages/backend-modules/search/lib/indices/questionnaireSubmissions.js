const type = 'QuestionnaireSubmission'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'public.questionnaireSubmissions',
  searchable: false,
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        id: {
          type: 'keyword',
        },
        questionnaireId: {
          type: 'keyword',
        },
        userId: {
          type: 'keyword',
        },
        createdAt: {
          type: 'date',
        },

        resolved: {
          properties: {
            answers: {
              properties: {
                payload: {
                  properties: {
                    text: {
                      type: 'text',
                      analyzer: 'german',
                    },
                  },
                },
                resolved: {
                  properties: {
                    value: {
                      properties: {
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
            user: {
              properties: {
                text: {
                  type: 'text',
                  analyzer: 'german',
                },
                hasPublicProfile: {
                  type: 'boolean',
                },
                name: {
                  type: 'text',
                },
              },
            },
          },
        },
      },
    },
  },
}
