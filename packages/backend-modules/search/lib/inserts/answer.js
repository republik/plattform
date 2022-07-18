const Promise = require('bluebird')

const bulk = require('../indexPgTable')

async function transform(row) {
  const { questionnaireId, questionId, userId, payload } = row

  const { question, submission } = await Promise.props({
    question: this.payload.getQuestion(questionId),
    submission: this.payload.getSubmission(questionnaireId, userId),
  })

  const { id, text, type, typePayload } = question

  const typeValue =
    (type === 'Choice' &&
      payload?.value.map(
        (value) =>
          typePayload.options.find((option) => option.value == value)?.label || // eslint-disable-line eqeqeq
          value,
      )) ||
    payload?.value

  row.resolved = {
    value: {
      [type]: typeValue,
    },
    question: {
      id,
      text,
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
          { fields: ['id', 'text', 'type', 'typePayload'] },
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
