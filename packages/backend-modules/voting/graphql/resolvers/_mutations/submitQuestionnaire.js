const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { findById, ensureReadyToSubmit } = require('../../../lib/Questionnaire')

module.exports = async (_, { id: questionnaireId }, context) => {
  const { pgdb, user: me, t, req, loaders } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    const questionnaire = await findById(questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, me.id, now, {
      ...context,
      pgdb: transaction,
    })

    const queryParams = { questionnaireId, userId: me.id }

    if (!questionnaire.submitAnswersImmediately) {
      await transaction.public.answers.query(
        `
        UPDATE answers
        SET payload = draft, draft = NULL
        WHERE "questionnaireId" = :questionnaireId
          AND "userId" = :userId
          AND draft IS NOT NULL
      `,
        queryParams,
      )

      await transaction.public.answers.query(
        `
        UPDATE answers
        SET submitted = TRUE
        WHERE "questionnaireId" = :questionnaireId
          AND "userId" = :userId
          AND submitted = FALSE
      `,
        queryParams,
      )
    }

    const questionnaireSubmissions = transaction.public.questionnaireSubmissions

    if (!(await questionnaireSubmissions.findOne(queryParams))) {
      await questionnaireSubmissions.insert(queryParams)
    } else {
      await questionnaireSubmissions.update(queryParams, {
        updatedAt: new Date(),
      })
    }

    await loaders.QuestionnaireSubmissions.byKeyObj.clear(queryParams)

    await transaction.transactionCommit()

    return questionnaire
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
