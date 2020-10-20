const generateMemberships = require('../generateMemberships')
const { sendPledgeConfirmations } = require('../Mail')
const slack = require('@orbiting/backend-modules-republik/lib/slack')
const { refreshPotForPledgeId } = require('../membershipPot')

const forUpdate = async ({ pledgeId, fn, pgdb }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const pledge = await transaction
      .query(
        `
          SELECT *
          FROM pledges
          WHERE id = :pledgeId
          FOR UPDATE
        `,
        {
          pledgeId,
        },
      )
      .then((response) => response[0])
      .catch((e) => {
        console.error(e)
        return null
      })

    await fn({
      pledge,
      transaction,
    })
      .then(async () => {
        await transaction.transactionCommit()
      })
      .catch((e) => {
        console.error(e)
        throw e
      })
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { error: e })
    throw e
  }
}

const changeStatus = async ({ pledge, newStatus, transaction }, context) => {
  console.log('changeStatus')

  const { redis, t } = context
  const pgdb = transaction || context.pgdb

  if (newStatus === 'SUCCESSFUL') {
    await generateMemberships(pledge.id, pgdb, t, redis)
  }

  return pgdb.public.pledges.updateAndGetOne(
    {
      id: pledge.id,
    },
    {
      status: newStatus,
      sendConfirmMail: true,
    },
  )
}

const afterChange = async ({ user, pledge }, context) => {
  console.log('afterChange', { user, pledge })

  const { pgdb, t } = context

  return Promise.all([
    user?.verified && sendPledgeConfirmations({ userId: user.id, pgdb, t }),
    pledge.status === 'SUCCESSFUL' && refreshPotForPledgeId(pledge.id, context),
    pledge.status === 'PAID_INVESTIGATE' &&
      slack.publishPledge(user, pledge, 'PAID_INVESTIGATE'),
  ]).catch((e) => {
    console.error('error in afterChange', e)
  })
}

const savePaymentDedup = async ({
  pledgeId,
  chargeId,
  total,
  transaction,
  method = 'STRIPE',
  status = 'PAID',
}) => {
  // save payment deduplicated
  const existingPayment = await transaction.public.payments.findFirst({
    method,
    pspId: chargeId,
  })

  if (existingPayment) {
    return existingPayment
  }

  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method,
    total,
    status,
    pspId: chargeId,
  })

  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  return payment
}

module.exports = {
  forUpdate,
  changeStatus,
  afterChange,
  savePaymentDedup,
}
