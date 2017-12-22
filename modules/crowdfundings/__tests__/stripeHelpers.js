const invoicePaymentSuccess = async () => {
  console.log(this)
}

const invoicePaymentFail = async () => {
  console.log(this)
}

const chargeSuccess = async () => {
  console.log(this)
}

const chargeRefund = async () => {
  console.log(this)
}

const customerSubscriptionDelete = async () => {
  console.log(this)
}

const customerSubscriptionUpdate = async () => {
  console.log(this)
}

const createSource = async (token) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_COMPANY_ONE)
  const source = await stripe.sources.create({
    type: 'card',
    token,
    currency: 'usd',
    owner: {
      email: 'willhelm.tell@republik.ch'
    }
  })
  return source
}

// see typesOfIntereset in webhookHandler.js
module.exports = {
  createSource,
  invoicePaymentSuccess,
  invoicePaymentFail,
  chargeSuccess,
  chargeRefund,
  customerSubscriptionDelete,
  customerSubscriptionUpdate
}
