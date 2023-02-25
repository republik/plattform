const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { findById, ensureReadyToSubmit } = require('../../../lib/Questionnaire')
const { v4: uuid } = require('uuid')

module.exports = async (_, { questionnaireId }, context) => {
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

    await transaction.public.questionnaireSubmissions.insert({
      questionnaireId,
      userId: me.id,
      anonymized: true,
    })

    await loaders.QuestionnaireSubmissions.byKeyObj.clear({
      userId: me.id,
      questionnaireId,
    })

    const pseudonym = uuid()
    const queryParams = { questionnaireId, userId: me.id, pseudonym }

    // move (unsubmitted) draft to payload
    await transaction.public.answers.query(
      `
      UPDATE answers
      SET payload = draft, draft = NULL
      WHERE "questionnaireId" = :questionnaireId
        AND "userId" = :userId
        AND draft IS NOT NULL
        AND submitted IS FALSE
    `,
      queryParams,
    )

    // flag answers as submitted, remove user and put pseudonym in place
    await transaction.public.answers.query(
      `
      UPDATE answers
      SET submitted = TRUE, "userId" = NULL, pseudonym = :pseudonym
      WHERE "questionnaireId" = :questionnaireId
        AND "userId" = :userId
    `,
      queryParams,
    )

    const { createdAt, updatedAt } = await transaction.public.answers.queryOne(
      `
      SELECT MAX("createdAt") "createdAt", MAX("updatedAt") "updatedAt"
      FROM answers
      WHERE "questionnaireId" = :questionnaireId
        AND pseudonym = :pseudonym
    `,
      queryParams,
    )

    await transaction.public.questionnaireSubmissions.insert({
      questionnaireId,
      pseudonym,
      createdAt,
      updatedAt,
    })

    await transaction.transactionCommit()

    return questionnaire
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
