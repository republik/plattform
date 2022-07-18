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
      },
    },
  },
}
