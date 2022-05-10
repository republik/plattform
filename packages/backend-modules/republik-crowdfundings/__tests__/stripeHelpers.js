const invoicePaymentSucceeded = require('../lib/payments/stripe/webhooks/invoicePaymentSucceeded')
const invoicePaymentFailed = require('../lib/payments/stripe/webhooks/invoicePaymentFailed')
const chargeSucceeded = require('../lib/payments/stripe/webhooks/chargeSucceeded')
const chargeRefunded = require('../lib/payments/stripe/webhooks/chargeRefunded')
const customerSubscription = require('../lib/payments/stripe/webhooks/customerSubscription')

const t = (text) => text

const invoicePaymentSuccess = async (
  { chargeId, paymentIntentId },
  pgdb,
  context,
  companyId,
) => {
  const event = {
    id: `INVOICE_PAYMENT_${chargeId}`,
    data: {
      object: {
        charge: chargeId,
        payment_intent: paymentIntentId,
      },
    },
  }
  await invoicePaymentSucceeded.handle(
    event,
    pgdb,
    t,
    context.redis,
    context,
    companyId,
  )
}

const invoicePaymentFail = async ({ pledgeId }, pgdb) => {
  const event = {
    id: `INVOICE_PAYMENT_${pledgeId}`,
    data: {
      object: {
        lines: {
          data: [
            {
              metadata: {
                pledgeId,
              },
              type: 'subscription',
            },
          ],
        },
      },
    },
  }
  await invoicePaymentFailed.handle(event, pgdb, t)
}

const chargeSuccess = async ({ total, chargeId }, pgdb) => {
  const event = {
    data: {
      object: {
        id: `CHARGE_${chargeId}`,
        amount: total,
      },
    },
  }
  await chargeSucceeded.handle(event, pgdb, t)
}

const chargeRefund = async ({ chargeId }, pgdb) => {
  const event = {
    data: {
      object: {
        id: chargeId,
      },
    },
  }
  await chargeRefunded.handle(event, pgdb, t)
}

const cancelSubscription = async ({ pledgeId, status, atPeriodEnd }, pgdb) => {
  const event = {
    data: {
      object: {
        id: `SUBSCRIPTION_${pledgeId}`,
        status,
        cancel_at_period_end: atPeriodEnd,
        metadata: {
          pledgeId,
        },
      },
    },
  }
  await customerSubscription.handle(event, pgdb, t)
}

const resetCustomers = async (pgdb) => {
  const Promise = require('bluebird')
  const { STRIPE_SECRET_KEY_COMPANY_ONE, STRIPE_SECRET_KEY_COMPANY_TWO } =
    process.env

  await pgdb.public.stripeCustomers.truncate({ cascade: true })

  await Promise.map(
    [STRIPE_SECRET_KEY_COMPANY_ONE, STRIPE_SECRET_KEY_COMPANY_TWO],
    async (key) => {
      const stripe = require('stripe')(key)
      const customers = await stripe.customers.list({ limit: 100 })

      await Promise.map(
        customers.data,
        (customer) => stripe.customers.del(customer.id),
        { concurrency: 10 },
      )
      console.log(`done deleting ${customers.data.length} stripe customers`)
    },
  )
}

const Cards = {
  Visa3D: {
    number: '4000000000003063',
    cvc: '101',
    exp_month: '12',
    exp_year: '2021',
  },
  Visa: {
    number: '4242424242424242',
    cvc: '102',
    exp_month: '12',
    exp_year: '2022',
  },
  Expired: {
    number: '4000000000000069',
    cvc: '103',
    exp_month: '12',
    exp_year: '2023',
  },
  Untrusted: {
    number: '4000000000009235',
    cvc: '104',
    exp_month: '12',
    exp_year: '2024',
  },
  Disputed: {
    number: '4000000000000259',
    cvc: '105',
    exp_month: '12',
    exp_year: '2025',
  },
  AuthNever: {
    number: '378282246310005',
    cvc: '111',
    exp_month: '01',
    exp_year: '2025',
  },
  AuthFirst: {
    number: '4000002500003155',
    cvc: '112',
    exp_month: '02',
    exp_year: '2025',
  },
  AuthAlways: {
    number: '4000002760003184',
    cvc: '113',
    exp_month: '02',
    exp_year: '2025',
  },
}

const createSource = async ({ total, card, ...metadata }) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_COMPANY_ONE)
  const source = await stripe.sources.create({
    type: 'card',
    currency: 'CHF',
    amount: total,
    usage: 'reusable',
    card,
    metadata,
  })
  return source
}

const createPaymentMethod = async ({ card, ...metadata }) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_COMPANY_ONE)
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card,
    metadata,
  })
  return paymentMethod
}

// see typesOfIntereset in webhookHandler.js
module.exports = {
  Cards,
  createSource,
  createPaymentMethod,
  resetCustomers,
  invoicePaymentSuccess,
  invoicePaymentFail,
  chargeSuccess,
  chargeRefund,
  cancelSubscription,
}
