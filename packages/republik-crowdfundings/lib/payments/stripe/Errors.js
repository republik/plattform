class RequirePaymentMethodError extends Error {
  constructor(paymentIntent) {
    super()
    this.message = 'payment intent requires an (other) payment method'
    this.name = 'RequirePaymentMethodError'
    this.paymentIntent = {
      id: paymentIntent.id,
      status: paymentIntent.status,
    }
  }
}

module.exports.RequirePaymentMethodError = RequirePaymentMethodError
