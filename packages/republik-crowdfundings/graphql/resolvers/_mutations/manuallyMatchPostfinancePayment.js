const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console

module.exports = async (_, args, {pgdb, req, t}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')

  const { id } = args
  const now = new Date()
  const transaction = await pgdb.transactionBegin()

  try {
    const pfp = await transaction.public.postfinancePayments.findOne({id})
    if (!pfp) {
      logger.error('postfinancePayment not found', { req: req._log(), args })
      throw new Error(t('api/payment/404'))
    }
    if (pfp.matched) {
      logger.error('postfinacePayment is matched already', { req: req._log(), args })
      throw new Error(t('api/postfinancePayment/match/noChange'))
    }

    const payments = await transaction.public.payments.find({
      hrid: pfp.mitteilung,
      status: 'PAID'
    })
    if (payments.length < 1) {
      logger.error('can not set pfp to paid if no related PAID payment is found', {
        req: req._log(),
        args
      })
      throw new Error(t('api/postfinancePayment/match/noPayment', {hrid: pfp.mitteilung}))
    }

    const pfp2 = transaction.public.postfinancePayments.find({
      'id !=': id,
      matched: true
    })
    if (pfp2.length) {
      logger.error('another postfinancePayment with the same hrid is matched already', {
        req: req._log(),
        args
      })
      throw new Error(t('api/postfinancePayment/match/duplicate', {hrid: pfp.mitteilung}))
    }

    await transaction.public.postfinancePayments.updateOne({
      id
    }, {
      matched: true,
      updatedAt: now
    })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return pgdb.public.postfinancePayments.findOne({id})
}
