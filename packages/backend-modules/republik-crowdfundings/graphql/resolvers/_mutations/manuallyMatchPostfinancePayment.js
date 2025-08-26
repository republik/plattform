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
        'postfinacePayment is matched already',
      )
      throw new Error(t('api/postfinancePayment/match/noChange'))
    }

    const payments = await transaction.public.payments.find({
      hrid: pfp.mitteilung,
      status: 'PAID',
    })
    if (payments.length < 1) {
      context.logger.error(
        { args },
        'can not set pfp to paid if no related PAID payment is found',
      )
      throw new Error(
        t('api/postfinancePayment/match/noPayment', { hrid: pfp.mitteilung }),
      )
    }

    const pfp2 = transaction.public.postfinancePayments.find({
      'id !=': id,
      matched: true,
    })
    if (pfp2.length) {
      context.logger.error(
        {
          args,
        },
        'another postfinancePayment with the same hrid is matched already',
      )
      throw new Error(
        t('api/postfinancePayment/match/duplicate', { hrid: pfp.mitteilung }),
      )
    }

    await transaction.public.postfinancePayments.updateOne(
      {
        id,
      },
      {
        matched: true,
        updatedAt: now,
      },
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'manually match PF payment failed')
    throw e
  }

  return pgdb.public.postfinancePayments.findOne({ id })
}
