const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, req, t } = context
  Roles.ensureUserHasRole(req.user, 'supporter')

  const { id } = args
  const now = new Date()
  const transaction = await pgdb.transactionBegin()

  try {
    const pfp = await transaction.public.postfinancePayments.findOne({ id })
    if (!pfp) {
      context.logger.error({ args }, 'postfinancePayment not found')
      throw new Error(t('api/payment/404'))
    }
    if (pfp.matched) {
      context.logger.error(
        {
          args,
        },
        'can not hide matched postfinancePayments',
      )
      throw new Error(t('api/postfinancePayment/hide/matched'))
    }

    await transaction.public.postfinancePayments.updateOne(
      {
        id,
      },
      {
        hidden: true,
        updatedAt: now,
      },
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'hide pf payment failed')
    throw e
  }

  return pgdb.public.postfinancePayments.findOne({ id })
}
