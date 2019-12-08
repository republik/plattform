const { Roles, AccessToken: { isFieldExposed } } = require('@orbiting/backend-modules-auth')

const debug = require('debug')('crowdfundings:resolver:User')
const flattenDeep = require('lodash/flattenDeep')
const moment = require('moment')

const {
  findEligableMemberships,
  hasDormantMembership,
  resolveMemberships
} = require('../../lib/CustomPackages')
const {
  getCustomPackages
} = require('../../lib/User')
const createCache = require('../../lib/cache')
const { getLastEndDate } = require('../../lib/utils')
const getStripeClients = require('../../lib/payments/stripe/clients')

const { DISABLE_RESOLVER_USER_CACHE } = process.env
const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // 1 day

const createMembershipCache = (user, prop, context) =>
  createCache({
    prefix: `User:${user.id}`,
    key: `${prop}`,
    ttl: QUERY_CACHE_TTL_SECONDS,
    disabled: DISABLE_RESOLVER_USER_CACHE
  }, context)

const getPaymentSources = async (user, pgdb) => {
  const { platform } = await getStripeClients(pgdb)
  if (!platform) {
    return []
  }
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
  async memberships (user, args, { pgdb, user: me }) {
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
  async activeMembership (user, args, context) {
    const { pgdb, user: me } = context
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return createMembershipCache(user, 'activeMembership', context)
        .cache(async () => pgdb.public.memberships.findFirst(
          { userId: user.id, active: true },
          { orderBy: { createdAt: 'ASC' } }
        ))
    }
    return null
  },
  async prolongBeforeDate (
    user,
    {
      ignoreClaimedMemberships = false,
      ignoreAutoPayFlag = false
    },
    context
  ) {
    const { pgdb, user: me } = context
    debug('prolongBeforeDate')

    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    const cache = createMembershipCache(
      user,
      `prolongBeforeDate-${ignoreClaimedMemberships}-${ignoreAutoPayFlag}`,
      context
    )

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

      const activeMembership = memberships.find(m => m.active)
      if (
        activeMembership &&
        activeMembership.membershipType.name === 'ABO_GIVE_MONTHS'
      ) {
        debug('active membership type "ABO_GIVE_MONTHS", return prolongBeforeDate: null')
        return null
      }

      const eligableMemberships = findEligableMemberships({
        memberships,
        user,
        ignoreClaimedMemberships
      })

      if (hasDormantMembership({ user, memberships: eligableMemberships })) {
        debug('found dormant membership, return prolongBeforeDate: null')
        return null
      }

      if (eligableMemberships.length < 1) {
        debug('found no prolongable membership, return prolongBeforeDate: null')
        return null
      }

      const allMembershipPeriods = eligableMemberships
        .filter(m => m.active && m.renew)
        .reduce(
          (acc, cur) => acc.concat(cur.periods),
          []
        )
        .filter(Boolean)

      if (allMembershipPeriods.length === 0) {
        debug('has active but cancelled membership, return prolongBeforeDate: null')
        return null
      }

      const lastEndDate = moment(getLastEndDate(allMembershipPeriods))

      if (!ignoreAutoPayFlag && activeMembership.autoPay && lastEndDate > moment().subtract(1, 'day')) {
        debug('active membership set to auto-pay and not overdue, return prolongBeforeDate: null')
        return null
      }

      const hasPendingPledges =
        !!activeMembership && await pgdb.public.query(`
          SELECT "pledges".* FROM "pledges"

          JOIN "pledgeOptions"
            ON "pledges"."id" = "pledgeOptions"."pledgeId"
            AND "pledgeOptions"."membershipId" = :activeMembershipId

          WHERE "pledges"."status" = 'WAITING_FOR_PAYMENT'
          ;
        `, { activeMembershipId: activeMembership.id })

      // Check if there are pending pledges, and last end date is not in future.
      if (hasPendingPledges.length > 0 && lastEndDate > moment()) {
        debug('pending pledge and not overdue, return prolongBeforeDate: null')
        return null
      }

      return lastEndDate
    })
  },
  async pledges (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.pledges.find({ userId: user.id }, { orderBy: ['createdAt desc'] })
    }
    return []
  },
  async paymentSources (user, args, { pgdb, user: me }) {
    if (
      Roles.userIsMeOrInRoles(user, me, ['admin']) ||
      isFieldExposed(user, 'paymentSources')
    ) {
      return getPaymentSources(user, pgdb)
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
  async isBonusEligable (user, args, context) {
    const { pgdb, user: me } = context
    debug('isBonusEligable')

    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    const cache = createMembershipCache(user, 'isBonusEligable', context)

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
