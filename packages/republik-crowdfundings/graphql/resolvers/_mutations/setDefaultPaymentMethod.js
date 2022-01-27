const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const getClients = require('../../../lib/payments/stripe/clients')
const {
  getPaymentMethods,
} = require('../../../lib/payments/stripe/paymentMethod')
const addPaymentMethod = require('../../../lib/payments/stripe/addPaymentMethod')
const normalizePaymentSource = require('../../../lib/payments/stripe/normalizePaymentSource')

module.exports = async (
  _,
  { stripePlatformPaymentMethodId },
  { pgdb, req, user: me, t },
) => {
  ensureSignedIn(req)
  const userId = me.id

  const clients = await getClients(pgdb)

  const paymentMethods = await getPaymentMethods({
    userId,
    pgdb,
    clients,
  })

  const paymentMethod = paymentMethods.find(
    (pm) => pm.id === stripePlatformPaymentMethodId,
  )

  if (!paymentMethod) {
    throw new Error(t('api/payment/paymentMethod/404'))
  }

  if (paymentMethod.isDefault) {
    return paymentMethods.map(normalizePaymentSource)
  }

  await addPaymentMethod({
    paymentMethodId: stripePlatformPaymentMethodId,
    userId,
    pgdb,
    clients,
    makeDefault: true,
  })

  return getPaymentMethods({
    userId,
    pgdb,
    clients,
  }).then((pms) => pms.map(normalizePaymentSource))
}
