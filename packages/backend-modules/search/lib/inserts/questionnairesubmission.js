const Promise = require('bluebird')

const bulk = require('../indexPgTable')

async function transform(row) {
  const { questionnaireId, userId } = row

  const { questions, answers } = await Promise.props({
    questions: this.payload.getQuestions(questionnaireId),
    answers: this.payload.getAnswers(questionnaireId, userId),
  })

  row.resolved = {
    answers: answers
      .map((answer) => {
        const question =
          questions.find((question) => question.id === answer.questionId) || {}

        const { id, text, type, typePayload } = question

        if (!type) {
          return false
        }

        const typeValue =
          (type === 'Choice' &&
            answer.payload?.value.map(
              (value) =>
                typePayload.options.find((option) => option.value == value) // eslint-disable-line eqeqeq
                  ?.label || value,
            )) ||
          answer.payload?.value

        return {
          ...answer,
          resolved: {
            question: {
              id,
              text,
            },
            value: {
              [type]: typeValue,
            },
          },
        }
      })
      .filter(Boolean),
  }

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.questionnaireSubmissions,
    payload: {
      getQuestions: async function (questionnaireId) {
        return pgdb.public.questions.find(
          { questionnaireId },
          { fields: ['id', 'text', 'type', 'typePayload'] },
        )
      },
      getAnswers: async function (questionnaireId, userId) {
        return pgdb.public.answers.find(
          { questionnaireId, userId },
          { fields: ['id', 'questionId', 'payload'] },
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
