const { Roles, AccessToken: { isFieldExposed } } = require('@orbiting/backend-modules-auth')
const debug = require('debug')('crowdfundings:resolver:User')
const Promise = require('bluebird')

const {
  resolvePackages,
  getCustomOptions
} = require('../../lib/CustomPackages')

const getStripeClients = require('../../lib/payments/stripe/clients')
const { isExpired } = require('./PaymentSource')

const getPaymentSources = async (user, pgdb) => {
  const { platform } = await getStripeClients(pgdb)
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

module.exports = {
  async memberships (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.memberships.find({
        userId: user.id
      }, {
        orderBy: {
          active: 'desc',
          sequenceNumber: 'asc'
        }
      })
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
    if (Roles.userIsMeOrInRoles(user, me, ['admin'])) {
      return getPaymentSources(user, pgdb)
    }
    return []
  },
  async hasChargableSource (user, args, context) {
    const { pgdb, user: me } = context
    if (
      Roles.userIsMeOrInRoles(user, me, ['admin']) ||
      isFieldExposed(user, 'hasChargableSource')
    ) {
      return getPaymentSources(user, pgdb)
        .then(sources =>
          !!sources
            .filter(source => !isExpired(source, {}, context))
            .length
        )
    }
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
    debug('customPackages')

    if (!isFieldExposed(user, 'customPackages')) {
      Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])
    }

    const now = new Date()

    const crowdfundings = args.crowdfundingName
      ? await pgdb.public.crowdfundings.find({
        name: args.crowdfundingName,
        'beginDate <=': now,
        'endDate >': now
      })
      : await pgdb.public.crowdfundings.find({
        'beginDate <=': now,
        'endDate >': now
      })

    const packages = await pgdb.public.packages.find({
      crowdfundingId: crowdfundings.map(crowdfunding => crowdfunding.id),
      custom: true
    })

    if (packages.length === 0) {
      return []
    }

    return Promise
      .map(
        await resolvePackages({ packages, pledger: user, pgdb }),
        async package_ => {
          if (package_.custom === true) {
            const options = await getCustomOptions(package_)

            if (options.length === 0) {
              return
            }

            return { ...package_, options }
          }

          return package_
        }
      )
      .filter(Boolean)
  },
  async adminNotes (user, args, { pgdb, user: me }) {
    Roles.ensureUserHasRole(me, 'supporter')
    return user.adminNotes || user._raw.adminNotes
  }
}
