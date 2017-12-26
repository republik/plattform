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
      logger.error('can not hide matched postfinancePayments', { req: req._log(), args })
      throw new Error(t('api/postfinancePayment/hide/matched'))
    }

    await transaction.public.postfinancePayments.updateOne({
      id
    }, {
      hidden: true,
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
