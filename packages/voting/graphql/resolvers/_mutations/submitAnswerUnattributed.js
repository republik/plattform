const {
  findById,
  ensureReadyToSubmit,
  transformQuestion,
  updateResultIncrementally
} = require('../../../lib/Questionnaire')
const {
  validateAnswer
} = require('../../../lib/Question')

module.exports = async (_, { answer, pseudonym }, context) => {
  const { pgdb, t } = context

  const { id, questionId, payload } = answer

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const question = await transaction.public.questions.findOne({ id: questionId })
    if (!question) {
      throw new Error(t('api/questionnaire/question/404'))
    }

    const questionnaire = await findById(question.questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, null, now, { ...context, pgdb: transaction })

    // check client generated ID
    const existingAnswer = await transaction.public.answers.findOne({ id })
    if (existingAnswer) {
      throw new Error(t('api/questionnaire/answer/idExists'))
    }
    const sameQuestionAnswer = await transaction.public.answers.findOne({
      'id !=': id,
      pseudonym: pseudonym,
      questionId
    })
    if (sameQuestionAnswer) {
      throw new Error(t('api/questionnaire/answer/immutable'))
    }

    if (payload.value === undefined || payload.value === null) {
      throw new Error(t('api/questionnaire/answer/empty'))
    }
    await validateAnswer(
      payload.value,
      question,
      {
        ...context,
        pgdb: transaction
      },
      payload
    )

    if (questionnaire.updateResultIncrementally) {
      await updateResultIncrementally(
        questionnaire.id,
        answer,
        transaction,
        context
      )
    }

    await transaction.public.answers.insert({
      id,
      questionId,
      questionnaireId: questionnaire.id,
      userId: null,
      pseudonym,
      unattributed: true,
      submitted: true,
      payload,
    })

    await transaction.transactionCommit()

    return transformQuestion(question, questionnaire)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
