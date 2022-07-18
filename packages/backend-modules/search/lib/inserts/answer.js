const Promise = require('bluebird')

const bulk = require('../indexPgTable')

async function transform(row) {
  const { questionnaireId, questionId, userId, payload } = row

  const { question, submission } = await Promise.props({
    question: this.payload.getQuestion(questionId),
    submission: this.payload.getSubmission(questionnaireId, userId),
  })

  const { type } = question

  row.resolved = {
    value: {
      [type]: payload?.value,
    },
    submission: submission ?? null,
  }

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.answers,
    payload: {
      getQuestion: async function (questionId) {
        return pgdb.public.questions.findOne(
          { id: questionId },
          { fields: ['id', 'type'] },
        )
      },
      getSubmission: async function (questionnaireId, userId) {
        return pgdb.public.questionnaireSubmissions.findOne(
          { questionnaireId, userId },
          { fields: ['id', 'createdAt'] },
        )
      },
    },
    transform,
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = Object.assign(
      await getDefaultResource({ resource, ...rest }),
      resource,
    )

    return bulk.index({ resource, ...rest })
  },
  after: () => {},
  final: () => {},
}
