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

module.exports.RequiresPaymentMethodError = RequiresPaymentMethodError
