const { Roles } = require('@orbiting/backend-modules-auth')
const {
  sendPaymentReminders,
} = require('../../../lib/payments/paymentslip/sendPaymentReminders')

module.exports = async (_, args, context) => {
  Roles.ensureUserHasRole(context.req.user, 'supporter')
  const { dryRun } = args
  return await sendPaymentReminders(context, { dryRun })
}
