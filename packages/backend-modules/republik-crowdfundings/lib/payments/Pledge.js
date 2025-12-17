const generateMemberships = require('../generateMemberships')
const { sendPledgeConfirmations } = require('../Mail')
const slack = require('@orbiting/backend-modules-republik/lib/slack')
const { refreshPotForPledgeId } = require('../membershipPot')
const getClients = require('./stripe/clients')
const {
  handleReferral,
} = require('@orbiting/backend-modules-referral-campaigns')

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
    handleReferral(pledge, context).catch((e) => console.log(e)),
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

// This method handles !subscription and subscription pledges
// and is idempotent.
const makePledgeSuccessfulWithCharge = async (
  args, // must include: companyId, (charge or chargeId)
  context,
) => {
  const { companyId } = args
  const { pgdb, t } = context

  const { accountForCompanyId } = await getClients(pgdb)
  const { stripe } = accountForCompanyId(companyId) || {}
  if (!stripe) {
    console.error(`stripe not found for companyId: ${companyId}`)
    throw new Error(t('api/unexpected'))
  }

  let charge = args.charge
  if (!charge) {
    charge = await stripe.charges.retrieve(args.chargeId)
  }
  if (!charge) {
    console.error(`missing charge for chargeId: ${args.chargeId}`)
    throw new Error(t('api/unexpected'))
  }

  let pledgeId = charge.metadata?.pledgeId // !subscription
  let subscription
  if (!pledgeId && charge.invoice) {
    // subscription
    // get pledgeId via charge.invoice.subscription
    const { invoice: invoiceId } = charge
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['subscription', 'payment_intent'],
    })
    subscription = invoice?.subscription
    pledgeId = subscription?.metadata?.pledgeId
  }

  if (!pledgeId) {
    console.error(`missing pledgeId for chargeId: ${charge.id}`)
    throw new Error(t('api/unexpected'))
  }

  const { pledge, updatedPledge } = await forUpdate({
    pledgeId,
    pgdb,
    fn: async ({ pledge, transaction }) => {
      if (!pledge) {
        return { pledge }
      }
      if (charge.status !== 'succeeded') {
        console.warn('makePledgeSuccessfulWithCharge charge.status!==succeeded')
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
      if (pledge.status === 'DRAFT') {
        updatedPledge = await changeStatus(
          {
            pledge,
            newStatus,
            transaction,
          },
          context,
        )
      }

      if (subscription) {
        const memberships = await transaction.public.memberships.find({
          pledgeId,
        })
        const firstNotification = memberships[0].subscriptionId === null
        const beginDate = new Date(subscription.current_period_start * 1000)
        const endDate = new Date(subscription.current_period_end * 1000)

        if (firstNotification) {
          // remember subscriptionId
          await transaction.public.memberships.update(
            {
              id: memberships.map((m) => m.id),
            },
            {
              subscriptionId: subscription.id,
            },
          )
          // synchronize beginDate and endDate with stripe
          await transaction.query(
            `
            UPDATE "membershipPeriods" mp
            SET
              "webhookEventId" = :webhookEventId,
              "beginDate" = :beginDate,
              "endDate" = :endDate,
              "updatedAt" = :now
            WHERE
              mp."membershipId" = ANY(:membershipIds) AND
              mp."webhookEventId" is null
          `,
            {
              webhookEventId: charge.id,
              beginDate,
              endDate,
              now: new Date(),
              membershipIds: memberships.map((m) => m.id),
            },
          )
        } else {
          // check for duplicate event
          if (
            !(await transaction.public.membershipPeriods.findFirst({
              webhookEventId: charge.id,
            }))
          ) {
            // insert membershipPeriods
            await Promise.all(
              memberships.map((membership) => {
                return transaction.public.membershipPeriods.insert({
                  membershipId: membership.id,
                  pledgeId: pledge.id,
                  beginDate,
                  endDate,
                  webhookEventId: charge.id,
                })
              }),
            )
            await transaction.public.memberships.update(
              {
                id: memberships.map((m) => m.id),
              },
              {
                active: true,
                updatedAt: new Date(),
              },
            )
          }
        }
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
  makePledgeSuccessfulWithCharge,
}
