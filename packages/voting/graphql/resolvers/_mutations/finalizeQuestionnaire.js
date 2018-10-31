const { Roles } = require('@orbiting/backend-modules-auth')
const {
  findBySlug,
  finalize
} = require('../../../lib/Questionnaire')

module.exports = async (_, args, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'admin')
  const { slug, dry } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const questionnaire = await findBySlug(slug, transaction)
    if (!questionnaire) {
      throw new Error(t(`api/questionnaire/404`))
    }
    if (questionnaire.result) {
      throw new Error(t(`api/questionnaire/result/alreadyFinalized`))
    }
    if (!dry && questionnaire.endDate > now) {
      throw new Error(t(`api/questionnaire/result/tooEarly`))
    }

    const result = await finalize(questionnaire, args, {
      ...context,
      pgdb: transaction
    })

    if (dry) {
      await transaction.transactionRollback()
    } else {
      await transaction.transactionCommit()
    }

    return result
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
