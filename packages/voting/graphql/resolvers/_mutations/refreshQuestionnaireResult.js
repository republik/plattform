const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const {
  findBySlug,
  refreshResult
} = require('../../../lib/Questionnaire')

module.exports = async (_, { slug }, context) => {
  const { pgdb, user: me, t } = context
  ensureUserHasRole(me, 'admin')

  let updatedQuestionnaire
  const transaction = await pgdb.transactionBegin()
  try {
    const questionnaire = await findBySlug(slug, transaction)
    if (!questionnaire) {
      throw new Error(t('api/questionnaire/404'))
    }

    updatedQuestionnaire = await refreshResult(
      questionnaire.id,
      transaction,
      context
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  return updatedQuestionnaire
}
