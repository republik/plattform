const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureOpeningHours,
  ensureReadyToSubmit
} = require('../../../lib/Questionnaire')

module.exports = async (_, { id: questionnaireId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    const questionnaire = await findById(questionnaireId, transaction)
    await ensureOpeningHours(questionnaire, me.id, now, transaction, t)
    await ensureReadyToSubmit(questionnaire, me.id, now, transaction, t)

    await pgdb.public.questionnaireSubmissions.insert({
      questionnaireId,
      userId: me.id
    })

    await transaction.transactionCommit()

    return questionnaire
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
