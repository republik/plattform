const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit,
  transformQuestion
} = require('../../../lib/Questionnaire')
const {
  validateAnswer
} = require('../../../lib/Question')

module.exports = async (_, { answer: { questionId, payload } }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const question = await transaction.public.questions.findOne({ id: questionId })
    if (!question) {
      throw new Error(t('api/questionnaire/question/404'))
    }

    const questionnaire = await findById(question.questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, me.id, now, transaction, t)

    let emptyAnswer = false
    if (!payload) {
      emptyAnswer = true
    } else {
      // validate payload
      if (payload.value === undefined || payload.value === null) {
        throw new Error(t('api/questionnaire/answer/empty'))
      }

      emptyAnswer = await validateAnswer(
        payload.value,
        question,
        {
          ...context,
          pgdb: transaction
        },
        payload
      )
    }

    const findQuery = {
      questionId,
      userId: me.id
    }
    const answerExists = await transaction.public.answers.findOne(findQuery)
    if (emptyAnswer) {
      if (answerExists) {
        await transaction.public.answers.deleteOne(findQuery)
      }
    } else {
      if (answerExists) {
        await transaction.public.answers.updateOne(
          findQuery,
          { payload }
        )
      } else {
        await transaction.public.answers.insert({
          questionId,
          userId: me.id,
          questionnaireId: questionnaire.id,
          payload
        })
      }
    }

    await transaction.transactionCommit()

    return transformQuestion(question, questionnaire)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
