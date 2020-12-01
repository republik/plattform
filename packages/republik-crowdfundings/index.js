const { PAYMENT_DEADLINE_DAYS } = require('./lib/payments/paymentslip/helpers')

module.exports = {
  PAYMENT_DEADLINE_DAYS,
  graphql: require('./graphql'),
}
