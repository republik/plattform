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
        throw e
      })

    const result = await fn({
      pledge,
      transaction,
    }).catch((e) => {
      console.error(e)
      throw e
    })

    await transaction.transactionCommit()

    return result
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { error: e })
    throw e
  }
}

const changeStatus = async ({ pledge, newStatus, transaction }, context) => {
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

const afterChange = async ({ pledge }, context) => {
  const { pgdb, t } = context

  let user
  if (pledge.status === 'PAID_INVESTIGATE') {
    user = await pgdb.public.users.findOne({ id: pledge.userId })
  }

  return Promise.all([
    sendPledgeConfirmations({ userId: pledge.userId, pgdb, t }),
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
  charge, // optional
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
    ...(charge ? { pspPayload: charge } : {}),
  })

  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  return payment
}

// This method is only suitable for !subscription pledges as it only calls
// generateMemberships (via changeStatus) and doesn't generate periods.
// See invoicePaymentSucceeded for how subscriptions are handled.
const makePledgeSuccessfulWithCharge = async (
  { pledgeId, charge },
  context,
) => {
  const { pgdb } = context

  const { pledge, updatedPledge } = await forUpdate({
    pledgeId,
    pgdb,
    fn: async ({ pledge, transaction }) => {
      if (!pledge) {
        return { pledge }
      }

      await savePaymentDedup({
        pledgeId: pledge.id,
        chargeId: charge.id,
        charge,
        total: charge.amount,
        transaction,
      })

      const newStatus = 'SUCCESSFUL'
      let updatedPledge
      if (pledge.status !== newStatus) {
        updatedPledge = await changeStatus(
          {
            pledge,
            newStatus,
            transaction,
          },
          context,
        )
      }

      return { pledge, updatedPledge }
    },
  })

  if (updatedPledge) {
    await afterChange(
      {
        pledge: updatedPledge,
      },
      context,
    )
  }

  return { pledge, updatedPledge }
}

module.exports = {
  forUpdate,
  changeStatus,
  afterChange,
  savePaymentDedup,
  makePledgeSuccessfulWithCharge,
}
