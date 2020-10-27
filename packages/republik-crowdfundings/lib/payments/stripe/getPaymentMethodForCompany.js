const getClients = require('./clients')
const { getPaymentMethods } = require('./paymentMethod')

module.exports = async ({
  userId,
  companyId,
  platformPaymentMethodId, // optional: if ommited, the default is used
  pgdb,
  clients: _clients, // optional
  t,
}) => {
  const clients = _clients || (await getClients(pgdb))

  // load all paymentMethods and select the one for companyId
  const paymentMethods = await getPaymentMethods({
    userId,
    pgdb,
    clients,
  })

  const platformPaymentMethod = paymentMethods.find((pm) =>
    platformPaymentMethodId ? pm.id === platformPaymentMethodId : pm.isDefault,
  )

  let paymentMethod
  if (platformPaymentMethod.companyId === companyId) {
    paymentMethod = platformPaymentMethod
  } else {
    paymentMethod = platformPaymentMethod.connectedPaymentMethods.find(
      (cpm) => cpm.companyId === companyId,
    )
  }

  if (!paymentMethod) {
    console.error(
      `missing paymentMethod userId: ${userId} companyId: ${companyId}`,
    )
    throw new Error(t('api/unexpected'))
  }

  return paymentMethod
}
