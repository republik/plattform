const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit
} = require('../../../lib/Questionnaire')

module.exports = async (_, { id: questionnaireId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    const questionnaire = await findById(questionnaireId, transaction)

    await ensureReadyToSubmit(questionnaire, me.id, now, { ...context, pgdb: transaction })

    await pgdb.public.answers.delete({
      questionnaireId,
      userId: me.id,
      submitted: false
    })

    await transaction.transactionCommit()

    return questionnaire
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
