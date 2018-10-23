const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureOpeningHours
} = require('../../../lib/Questionnaire')

module.exports = async (_, { id: questionnaireId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    const questionnaire = await findById(questionnaireId, transaction)
    await ensureOpeningHours(questionnaire, me.id, now, transaction, t)

    await pgdb.public.questionnaireSubmissions.delete({
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
