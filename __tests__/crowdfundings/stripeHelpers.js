const invoicePaymentSucceeded = require('../../modules/crowdfundings/lib/payments/stripe/webhooks/invoicePaymentSucceeded')
const invoicePaymentFailed = require('../../modules/crowdfundings/lib/payments/stripe/webhooks/invoicePaymentFailed')
const chargeSucceeded = require('../../modules/crowdfundings/lib/payments/stripe/webhooks/chargeSucceeded')
// const chargeRefunded = require('../../modules/crowdfundings/lib/payments/stripe/webhooks/chargeRefunded')
const customerSubscription = require('../../modules/crowdfundings/lib/payments/stripe/webhooks/customerSubscription')

const t = (text) => text

const invoicePaymentSuccess = async ({ pledgeId, total, chargeId, start, end }, pgdb) => {
  const event = {
    id: `INVOICE_PAYMENT_${pledgeId}`,
    data: {
      object: {
        charge: `CHARGE_${chargeId}`,
        total,
        lines: {
          data: [
            {
              id: `SUBSCRIPTION_${chargeId}`,
              metadata: {
                pledgeId
              },
              period: {
                start,
                end
              },
              type: 'subscription'
            }
          ]
        }
      }
    }
  }
  await invoicePaymentSucceeded.handle(event, pgdb, t)
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
                pledgeId
              },
              type: 'subscription'
            }
          ]
        }
      }
    }
  }
  await invoicePaymentFailed.handle(event, pgdb, t)
}

const chargeSuccess = async ({ total, chargeId }, pgdb) => {
  const event = {
    data: {
      object: {
        id: `CHARGE_${chargeId}`,
        amount: total
      }
    }
  }
  await chargeSucceeded.handle(event, pgdb, t)
}

const chargeRefund = async () => {
  console.log(this)
}

const cancelSubscription = async ({ pledgeId, status, atPeriodEnd }, pgdb) => {
  const event = {
    data: {
      object: {
        id: `SUBSCRIPTION_${pledgeId}`,
        status,
        cancel_at_period_end: atPeriodEnd,
        metadata: {
          pledgeId
        }
      }
    }
  }
  await customerSubscription.handle(event, pgdb, t)
}

const resetCustomers = async (pgdb) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_COMPANY_ONE)
  const customers = await stripe.customers.list({ limit: 100 })
  pgdb.public.stripeCustomers.truncate({ cascade: true })
  for (const customer of customers.data) {
    await stripe.customers.del(customer.id)
  }
}

const Cards = {
  Visa3D: {
    number: '4000000000003063',
    cvc: '101',
    exp_month: '12',
    exp_year: '2021'
  },
  Visa: {
    number: '4242424242424242',
    cvc: '102',
    exp_month: '12',
    exp_year: '2022'
  },
  Expired: {
    number: '4000000000000069',
    cvc: '103',
    exp_month: '12',
    exp_year: '2023'
  },
  Untrusted: {
    number: '4000000000009235',
    cvc: '104',
    exp_month: '12',
    exp_year: '2024'
  },
  Disputed: {
    number: '4000000000000259',
    cvc: '105',
    exp_month: '12',
    exp_year: '2025'
  }
}

const createSource = async ({ total, card, ...metadata }) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_COMPANY_ONE)
  const source = await stripe.sources.create({
    type: 'card',
    currency: 'CHF',
    amount: total,
    usage: 'reusable',
    card,
    metadata
  })
  return source
}

// see typesOfIntereset in webhookHandler.js
module.exports = {
  Cards,
  createSource,
  resetCustomers,
  invoicePaymentSuccess,
  invoicePaymentFail,
  chargeSuccess,
  chargeRefund,
  cancelSubscription
}
