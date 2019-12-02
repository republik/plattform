const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit,
  transformQuestion,
  updateResultIncrementally
} = require('../../../lib/Questionnaire')
const {
  validateAnswer
} = require('../../../lib/Question')

module.exports = async (_, { answer }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const { id, questionId, payload } = answer

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const question = await transaction.public.questions.findOne({ id: questionId })
    if (!question) {
      throw new Error(t('api/questionnaire/question/404'))
    }

    const questionnaire = await findById(question.questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, me.id, now, { ...context, pgdb: transaction })

    // check client generated ID
    const existingAnswer = await transaction.public.answers.findOne({ id })
    if (existingAnswer) {
      if (existingAnswer.userId !== me.id) {
        throw new Error(t('api/questionnaire/answer/idExists'))
      }
      if (existingAnswer.questionId !== questionId) {
        throw new Error(t('api/questionnaire/answer/noQuestionRemapping'))
      }
    }
    const sameAnswer = await transaction.public.answers.findOne({
      'id !=': id,
      userId: me.id,
      questionId
    })
    if (
      (existingAnswer && existingAnswer.submitted) ||
      (sameAnswer && sameAnswer.submitted)
    ) {
      throw new Error(t('api/questionnaire/answer/immutable'))
    }
    if (sameAnswer) {
      await transaction.public.answers.deleteOne({ id: sameAnswer.id })
    }

    // validate
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

    if (emptyAnswer && questionnaire.noEmptyAnswers) {
      throw new Error(t('api/questionnaire/answer/empty'))
    }

    if (questionnaire.updateResultIncrementally) {
      await updateResultIncrementally(
        questionnaire.id,
        answer,
        transaction,
        context
      )
    }

    // write
    const findQuery = { id }
    if (emptyAnswer) {
      if (existingAnswer) {
        await transaction.public.answers.deleteOne(findQuery)
      }
    } else {
      if (existingAnswer) {
        await transaction.public.answers.updateOne(
          findQuery,
          {
            questionId,
            payload,
            updatedAt: now
          }
        )
      } else {
        await transaction.public.answers.insert({
          id,
          questionId,
          questionnaireId: questionnaire.id,
          userId: me.id,
          payload,
          submitted: questionnaire.submitAnswersImmediately
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
