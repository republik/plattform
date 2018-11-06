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
  async customPackages (user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

    const now = new Date()

    const crowdfunding = args.crowdfundingName
      ? await pgdb.public.crowdfundings.findOne({ name: args.crowdfundingName })
      : await pgdb.public.crowdfundings.findOne({
        'beginDate <=': now,
        'endDate >': now
      })

    const packages = await pgdb.public.packages.find({
      crowdfundingId: crowdfunding.id,
      custom: true
    })

    const pledges = await pgdb.public.pledges.find({
      userId: user.id,
      status: 'SUCCESSFUL'
    })

    const memberships =
      pledges.length > 0
        ? await pgdb.public.memberships.find({
          pledgeId: pledges.map(pledge => pledge.id)
        })
        : []

    // Mutation user object here? (... meh...)
    Object.assign(user, { memberships })

    return packages.map(package_ => ({ ...package_, user }))
  },
  async adminNotes (user, args, { pgdb, user: me }) {
    Roles.ensureUserHasRole(me, 'supporter')
    return user.adminNotes || user._raw.adminNotes
  }
}
