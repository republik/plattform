const type = 'QuestionnaireSubmission'

module.exports = {
  type,
  path: 'public.questionnaireSubmissions',
  searchable: false,
  mapping: {
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
      anonymized: {
        type: 'boolean',
      },
      createdAt: {
        type: 'date',
      },

      resolved: {
        properties: {
          answers: {
            type: 'nested',
            properties: {
              questionId: {
                type: 'keyword',
              },
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
                      length: {
                        type: 'integer',
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
              name: {
                type: 'text',
                analyzer: 'german',
              },
              hasPublicProfile: {
                type: 'boolean',
              },
            },
          },
        },
      },
    },
  },
}
