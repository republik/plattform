const { sendPledgeConfirmations } = require('../../../lib/Mail')
const mergeCustomers = require('../../../lib/payments/stripe/mergeCustomers')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail: { enforceSubscriptions },
  } = context
  // check user
  if (!req.user) {
    context.logger.error({ args }, 'unauthorized reclaimPledge')
    throw new Error(t('api/unauthorized'))
  }

  const transaction = await pgdb.transactionBegin()
  try {
    const { pledgeId } = args
    // check pledgeId
    const pledge = await transaction.public.pledges.findOne({ id: pledgeId })
    if (!pledge) {
      context.logger.error(
        {
          args,
          pledge,
          pledgeId,
        },
        `pledge not found`,
      )
      throw new Error(t('api/unexpected'))
    }

    // load original user of pledge
    const pledgeUser = await transaction.public.users.findOne({
      id: pledge.userId,
    })
    if (pledgeUser.email === req.user.email) {
      context.logger.info(
        {
          args,
          pledgeUser,
        },
        'pledge already belongs to the claiming email',
      )
      await transaction.transactionCommit()
      return true
    }
    if (pledgeUser.verified) {
      context.logger.error(
        {
          args,
          pledge,
        },
        'cannot claim pledges of verified users',
      )
      throw new Error(
        t('api/reclaim/verified', {
          pledgeEmail: pledgeUser.email,
          targetEmail: req.user.email,
        }),
      )
    }

    // transfer belongings to signedin user
    // as pledgeUser is new (unverfied) he/she can not have many relations
    const newUser = req.user
    const to = { userId: newUser.id }
    const from = { userId: pledgeUser.id }
    const promises = [
      transaction.public.pledges.updateOne({ id: pledge.id }, to),
      transaction.public.memberships.update(from, to),
      transaction.public.paymentSources.update(from, to),
      transaction.public.consents.update(from, to),
      transaction.public.users.updateOne(
        { id: newUser.id },
        {
          firstName: newUser.firstName || pledgeUser.firstName,
          lastName: newUser.lastName || pledgeUser.lastName,
          addressId: newUser.addressId || pledgeUser.addressId,
        },
      ),
      mergeCustomers({
        targetUser: newUser,
        sourceUser: pledgeUser,
        pgdb: transaction,
      }),
    ]
    if (pledgeUser.addressId) {
      promises.push(
        transaction.public.users.updateOne(
          { id: pledgeUser.id },
          { addressId: null },
        ),
      )
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
        subscribeToEditorialNewsletters: true,
        subscribeToOnboardingMails: true,
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      context.logger.error(
        {
          args,
          error: e,
        },
        'newsletter subscription changes failed',
      )
    }

    return true
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ error: e }, 'reclaim pledge failed')
    throw e
  }
}
