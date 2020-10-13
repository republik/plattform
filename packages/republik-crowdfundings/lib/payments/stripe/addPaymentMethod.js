const getClients = require('./clients')

// deduplication (like in addSource) is not possible. The paymentMethod mus
// be attached otherwise there is no customer <> payment connection
module.exports = async ({
  paymentMethodId,
  userId,
  pgdb,
  clients, // optional
  makeDefault = false,
  t,
}) => {
  const { platform, connectedAccounts } = clients || (await getClients(pgdb))

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId: platform.company.id,
  })
  if (!customer) {
    throw new Error(
      `could not find stripeCustomer for userId: ${userId} companyId: ${platform.company.id}`,
    )
  }

  await platform.stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  })

  if (makeDefault) {
    await platform.stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  for (const connectedAccount of connectedAccounts) {
    const connectedCustomer = await pgdb.public.stripeCustomers.findOne({
      userId,
      companyId: connectedAccount.company.id,
    })
    if (!connectedCustomer) {
      throw new Error(
        `could not find stripeCustomer for userId: ${userId} companyId: ${connectedAccount.company.id}`,
      )
    }

    const connectedPaymentMethod = await platform.stripe.paymentMethods.create(
      {
        customer: customer.id,
        payment_method: paymentMethodId,
      },
      {
        stripeAccount: connectedAccount.accountId,
      },
    )

    await platform.stripe.paymentMethods.attach(
      connectedPaymentMethod.id,
      { customer: connectedCustomer.id },
      {
        stripeAccount: connectedAccount.accountId,
      },
    )

    if (makeDefault) {
      await platform.stripe.customers.update(
        connectedCustomer.id,
        {
          invoice_settings: {
            default_payment_method: connectedPaymentMethod.id,
          },
        },
        {
          stripeAccount: connectedAccount.accountId,
        },
      )
    }
  }

  return paymentMethodId
}
