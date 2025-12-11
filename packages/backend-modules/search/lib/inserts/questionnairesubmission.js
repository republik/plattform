const Promise = require('bluebird')

const bulk = require('../indexPgTable')

async function transform(row) {
  const { questionnaireId, userId, pseudonym } = row

  const { questions, answers, user } = await Promise.props({
    questions: this.payload.getQuestions(questionnaireId),
    answers: this.payload.getAnswers(questionnaireId, userId, pseudonym),
    user: this.payload.getUser(userId),
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
          (['Choice', 'ImageChoice'].includes(type) &&
            answer.payload?.value.map(
              (value) =>
                typePayload.options.find((option) => option.value == value) // eslint-disable-line eqeqeq
                  ?.label || value,
            )) ||
          answer.payload?.value

        const length =
          type === 'Text' && typeValue?.length ? typeValue.length : undefined

        return {
          ...answer,
          resolved: {
            value: {
              [type]: typeValue,
              length,
            },
            question: {
              id,
              text,
            },
          },
        }
      })
      .filter(Boolean),
    ...(user && {
      user: {
        name: [user.firstName, user.lastName].join(' ').trim(),
        hasPublicProfile: user.hasPublicProfile,
      },
    }),
  }

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.questionnaireSubmissions,
    payload: {
      getQuestions: async (questionnaireId) =>
        pgdb.public.questions.find(
          { questionnaireId },
          { fields: ['id', 'text', 'type', 'typePayload'] },
        ),
      getAnswers: async (questionnaireId, userId, pseudonym) => {
        if (!userId && !pseudonym) {
          return []
        }

        return pgdb.public.answers.find(
          {
            questionnaireId,
            ...(userId && { userId }),
            ...(pseudonym && { pseudonym }),
            submitted: true,
          },
          { fields: ['id', 'questionId', 'payload'] },
        )
      },
      getUser: async (id) =>
        pgdb.public.users.findOne(
          { id },
          {
            fields: ['firstName', 'lastName', 'hasPublicProfile'],
          },
        ),
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
