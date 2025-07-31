const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, req, t } = context
  Roles.ensureUserHasRole(req.user, 'supporter')

  const { pfpId, mitteilung } = args
  const now = new Date()
  const transaction = await pgdb.transactionBegin()

  try {
    const pfp = await transaction.public.postfinancePayments.findOne({
      id: pfpId,
    })
    if (!pfp) {
      context.logger.error({ args }, 'postfinancePayment not found')
      throw new Error(t('api/payment/404'))
    }

    await transaction.public.postfinancePayments.updateOne(
      {
        id: pfpId,
      },
      {
        mitteilung,
        updatedAt: now,
      },
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.info({ args, error: e }, 'update postfinance payment failed')
    throw e
  }

  return pgdb.public.postfinancePayments.findOne({ id: pfpId })
}
