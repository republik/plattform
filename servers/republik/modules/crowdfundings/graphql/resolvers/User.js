const { Roles } = require('@orbiting/backend-modules-auth')
const getStripeClients = require('../../lib/payments/stripe/clients')

module.exports = {
  async memberships (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.memberships.find({userId: user.id})
    }
    return []
  },
  async pledges (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.pledges.find({userId: user.id}, {orderBy: ['createdAt desc']})
    }
    return []
  },
  async paymentSources (user, args, { pgdb, user: me }) {
    const { platform } = await getStripeClients(pgdb)
    if (Roles.userIsMeOrInRoles(user, me, ['admin'])) {
      const customer = await pgdb.public.stripeCustomers.findOne({
        userId: user.id,
        companyId: platform.company.id
      })
      if (!customer) {
        return []
      }
      const stripeCustomer = await platform.stripe.customers.retrieve(customer.id)
      if (!stripeCustomer || !stripeCustomer.sources || !stripeCustomer.sources.data) {
        return []
      }
      return stripeCustomer.sources.data.map(source => ({
        id: source.id,
        isDefault: source.id === stripeCustomer.default_source,
        status: source.status.toUpperCase(),
        brand: source.card.brand,
        last4: source.card.last4,
        expMonth: source.card.exp_month,
        expYear: source.card.exp_year
      }))
    }
    return []
  },
  async adminNotes (user, args, { pgdb, user: me }) {
    Roles.ensureUserHasRole(me, 'supporter')
    return user.adminNotes || user._raw.adminNotes
  }
}
