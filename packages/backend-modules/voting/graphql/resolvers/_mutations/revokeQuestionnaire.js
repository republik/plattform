const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { findById } = require('../../../lib/Questionnaire')

module.exports = async (_, { id: questionnaireId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const questionnaire = await findById(questionnaireId, transaction)
    if (!questionnaire) {
      throw new Error(t('api/questionnaire/404'))
    }

    if (!questionnaire.revokeSubmissions) {
      throw new Error(t('api/questionnaire/submission/noRevokeSubmissions'))
    }

    const queryParams = { questionnaireId, userId: me.id }

    // @TODO see if submission was anonymized
    const submission =
      await transaction.public.questionnaireSubmissions.findOne(queryParams)

    if (!submission || submission.userId !== me.id) {
      throw new Error(t('api/questionnaire/submission/404'))
    }

    await transaction.public.answers.query(
      `
      UPDATE answers
      SET draft = payload, payload = NULL, submitted = false
      WHERE "questionnaireId" = :questionnaireId
        AND "userId" = :userId
        AND draft IS NULL
    `,
      queryParams,
    )

    await transaction.public.answers.query(
      `
      UPDATE answers
      SET payload = NULL, submitted = false
      WHERE "questionnaireId" = :questionnaireId
        AND "userId" = :userId
        AND draft IS NOT NULL
    `,
      queryParams,
    )

    await transaction.public.questionnaireSubmissions.delete(queryParams)

    await transaction.transactionCommit()

    return questionnaire
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
