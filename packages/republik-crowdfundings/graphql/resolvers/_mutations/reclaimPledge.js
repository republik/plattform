const logger = console
const { sendPledgeConfirmations } = require('../../../lib/Mail')
const mergeCustomers = require('../../../lib/payments/stripe/mergeCustomers')

module.exports = async (_, args, {pgdb, req, t, mail: {enforceSubscriptions}}) => {
  // check user
  if (!req.user) {
    logger.error('unauthorized reclaimPledge', { req: req._log(), args })
    throw new Error(t('api/unauthorized'))
  }

  const transaction = await pgdb.transactionBegin()
  try {
    const { pledgeId } = args
    // check pledgeId
    const pledge = await transaction.public.pledges.findOne({id: pledgeId})
    if (!pledge) {
      logger.error(`pledge (${pledgeId}) not found`, { req: req._log(), args, pledge })
      throw new Error(t('api/unexpected'))
    }

    // load original user of pledge
    const pledgeUser = await transaction.public.users.findOne({id: pledge.userId})
    if (pledgeUser.email === req.user.email) {
      logger.info('pledge already belongs to the claiming email', { req: req._log(), args, pledgeUser })
      await transaction.transactionCommit()
      return true
    }
    if (pledgeUser.verified) {
      logger.error('cannot claim pledges of verified users', { req: req._log(), args, pledge })
      throw new Error(t('api/reclaim/verified', {
        pledgeEmail: pledgeUser.email,
        targetEmail: req.user.email
      }))
    }

    // transfer belongings to signedin user
    // as pledgeUser is new (unverfied) he/she can not have many relations
    const newUser = req.user
    const to = { userId: newUser.id }
    const from = { userId: pledgeUser.id }
    const promises = [
      transaction.public.pledges.updateOne({id: pledge.id}, to),
      transaction.public.memberships.update(from, to),
      transaction.public.paymentSources.update(from, to),
      transaction.public.consents.update(from, to),
      transaction.public.users.updateOne({id: newUser.id}, {
        firstName: newUser.firstName || pledgeUser.firstName,
        lastName: newUser.lastName || pledgeUser.lastName,
        birthday: newUser.birthday || pledgeUser.birthday,
        addressId: newUser.addressId || pledgeUser.addressId
      }),
      mergeCustomers({
        targetUserId: newUser.id,
        sourceUserId: pledgeUser.id,
        pgdb: transaction
      })
    ]
    if (pledgeUser.addressId) {
      promises.push(transaction.public.users.updateOne({id: pledgeUser.id}, {addressId: null}))
    }
    await Promise.all(promises)

    // send confirmation mail
    await sendPledgeConfirmations({ userId: newUser.id, pgdb: transaction, t })

    // commit transaction
    await transaction.transactionCommit()

    try {
      await enforceSubscriptions({ pgdb, userId: pledgeUser.id })
      await enforceSubscriptions({
        pgdb,
        userId: req.user.id,
        subscribeToEditorialNewsletters: true
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      logger.error('newsletter subscription changes failed', { req: req._log(), args, error: e })
    }

    return true
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), error: e })
    throw e
  }
}
