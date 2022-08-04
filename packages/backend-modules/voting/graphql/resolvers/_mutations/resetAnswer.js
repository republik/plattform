const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit,
  transformQuestion,
} = require('../../../lib/Questionnaire')

module.exports = async (_, { id: answerId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const answer = await transaction.public.answers.findOne({
      id: answerId,
      userId: me.id,
    })
    if (!answer) {
      throw new Error('api/questionnaire/answer/404')
    }

    const { questionId, questionnaireId, submitted } = answer
    const question = await transaction.public.questions.findOne({
      id: questionId,
      questionnaireId,
    })
    if (!question) {
      throw new Error('api/questionnaire/answer/404')
    }

    const now = new Date()
    const questionnaire = await findById(questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, me.id, now, {
      ...context,
      pgdb: transaction,
    })

    if (!submitted) {
      await transaction.public.answers.delete({ id: answerId })
    } else {
      await transaction.public.answers.update({ id: answerId }, { draft: null })
    }

    await transaction.transactionCommit()

    return transformQuestion(question, questionnaire)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
