class RequiresPaymentMethodError extends Error {
  constructor(paymentIntent) {
    super()
    this.message = 'payment intent requires an (other) payment method'
    this.name = 'RequiresPaymentMethodError'
    this.paymentIntent = {
      id: paymentIntent.id,
      status: paymentIntent.status,
    }
  }
}

const throwError = (e, { pledgeId, membershipId, t, kind }) => {
  if (e.type === 'StripeCardError') {
    const translatedError = t('api/pay/stripe/' + e.code)
    if (translatedError) {
      console.warn(e, { pledgeId, membershipId, kind })
      throw new Error(translatedError)
    } else {
      console.warn('translation not found for stripe error', {
        pledgeId,
        kind,
        e,
      })
      throw new Error(e.message)
    }
  }

  if (e.name === 'RequiresPaymentMethodError') {
    console.warn(e, { pledgeId, membershipId, kind })
    throw new Error(t('api/pay/stripe/card_declined'))
  }

  console.error(e, { pledgeId, membershipId, kind })
  throw new Error(t('api/unexpected'))
}

module.exports.RequiresPaymentMethodError = RequiresPaymentMethodError
module.exports.throwError = throwError
