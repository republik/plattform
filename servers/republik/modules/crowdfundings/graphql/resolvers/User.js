const { Roles, AccessToken: { isFieldExposed } } = require('@orbiting/backend-modules-auth')

const debug = require('debug')('crowdfundings:resolver:User')
const flattenDeep = require('lodash/flattenDeep')
const Promise = require('bluebird')

const {
  findEligableMemberships,
  resolvePackages,
  resolveMemberships,
  getCustomOptions
} = require('../../lib/CustomPackages')
const createCache = require('../../lib/cache')
const { getPeriodEndingLast } = require('../../lib/utils')
const getStripeClients = require('../../lib/payments/stripe/clients')
const { isExpired } = require('./PaymentSource')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // 1 day

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

const getCustomPackages = async ({ user, crowdfundingName, pgdb }) => {
  const now = new Date()

  const crowdfundings = crowdfundingName
    ? await pgdb.public.crowdfundings.find({
      name: crowdfundingName,
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
  async prolongBeforeDate (user, { ignoreClaimedMemberships = false }, { pgdb, user: me }) {
    debug('prolongBeforeDate')

    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    const cache = createCache({
      prefix: `User:${user.id}`,
      key: `prolongBeforeDate-${ignoreClaimedMemberships}`,
      ttl: QUERY_CACHE_TTL_SECONDS
    })

    return cache.cache(async function () {
      let memberships = await pgdb.public.memberships.find({
        userId: user.id
      })

      // No memberships, set cache and return 0
      if (memberships.length === 0) {
        debug('no memberships founds, return prolongBeforeDate: null')

        return null
      }

      memberships = await resolveMemberships({ memberships, pgdb })
      const eligableMemberships = findEligableMemberships({
        memberships,
        user,
        ignoreClaimedMemberships
      })

      if (eligableMemberships.filter(m => !m.active).length > 0) {
        debug('found dormant membership, return prolongBeforeDate: null')

        return null
      }

      if (eligableMemberships.length < 1) {
        debug('found no prolongable membership, return prolongBeforeDate: null')

        return null
      }

      if (memberships.filter(m => m.active && m.renew).length === 0) {
        debug('has active but cancelled membership, return prolongBeforeDate: null')

        return null
      }

      const membershipPeriods =
        await pgdb.public.membershipPeriods.find({
          membershipId: memberships.map(membership => membership.id)
        })

      return getPeriodEndingLast(membershipPeriods).endDate
    })
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
        pkg.name NOT IN ('ABO_GIVE', 'ABO_GIVE_MONTHS')
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

    return getCustomPackages({ user, pgdb })
  },
  async isBonusEligable (user, args, { pgdb, user: me }) {
    debug('isBonusEligable')

    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    const cache = createCache({
      prefix: `User:${user.id}`,
      key: 'isBonusEligable',
      ttl: QUERY_CACHE_TTL_SECONDS
    })

    return cache.cache(async function () {
      const allPeriods = (await getCustomPackages({ user, pgdb }))
        .map(
          package_ => package_.options.map(
            option => option.additionalPeriods
          )
        )

      return !!flattenDeep(allPeriods).find(period => period.kind === 'BONUS')
    })
  },
  async adminNotes (user, args, { pgdb, user: me }) {
    Roles.ensureUserHasRole(me, 'supporter')
    return user.adminNotes || user._raw.adminNotes
  }
}
