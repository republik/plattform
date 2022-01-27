const getStripeClients = require('../clients')

module.exports = {
  eventTypes: [
    'payment_method.attached',
    'payment_method.automatically_updated',
    'payment_method.detached',
    'payment_method.updated',
    'customer.updated',
    'customer.source.created',
    'customer.source.deleted',
    'customer.source.updated',
  ],
  handle: async (event, pgdb, t) => {
    let customerId
    if (event.type.startsWith('customer')) {
      customerId = event.data?.object?.id
    } else if (event.type.startsWith('payment_method')) {
      customerId = event.data?.object?.customer
    }

    if (customerId) {
      const {
        platform: {
          company: { id: companyId },
        },
      } = await getStripeClients(pgdb)

      await pgdb.query(
        `
        UPDATE "stripeCustomers"
        SET cache = null
        WHERE
          "companyId" = :companyId AND
          "userId" = (
            SELECT "userId" FROM "stripeCustomers"
            WHERE id = :customerId
          )
      `,
        {
          customerId,
          companyId,
        },
      )
    }

    return 200
  },
}
