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
  async checkMembershipSubscriptions (user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])
    const memberships = await pgdb.query(`
      SELECT
        m.*,
        to_json(mt.*) as "membershipType"
      FROM
        memberships m
      JOIN
        "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      JOIN
        pledges p
        ON m."pledgeId" = p.id
      JOIN
        packages pkg
        ON p."packageId" = pkg.id
      WHERE
        m."userId" = :userId AND
        pkg.name != 'ABO_GIVE'
    `, {
      userId: user.id
    })

    const monthly = memberships.find(m =>
      m.membershipType.name === 'MONTHLY_ABO' &&
      m.active === true &&
      m.renew === true
    )

    if (monthly && memberships.length > 1) {
      return true
    }
    return false
  },
  async adminNotes (user, args, { pgdb, user: me }) {
    Roles.ensureUserHasRole(me, 'supporter')
    return user.adminNotes || user._raw.adminNotes
  }
}
