const moment = require('moment')
const _ = require('lodash')

const { transformUser, Roles } = require('@orbiting/backend-modules-auth')
const { applyPgInterval: { add: addInterval } } = require('@orbiting/backend-modules-utils')

const { getLastEndDate } = require('../../lib/utils')
const { getCustomPackages } = require('../../lib/User')
const createCache = require('../../lib/cache')

const { DISABLE_RESOLVER_USER_CACHE } = process.env
const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // 1 day

const createMembershipCache = (membership, prop, context) =>
  createCache({
    prefix: `User:${membership.userId}`,
    key: `membership:${membership.id}:${prop}`,
    ttl: QUERY_CACHE_TTL_SECONDS,
    disabled: DISABLE_RESOLVER_USER_CACHE
  }, context)

module.exports = {
  async type (membership, args, context) {
    const { pgdb } = context
    return createMembershipCache(membership, 'type', context)
      .cache(async () => pgdb.public.membershipTypes.findOne({
        id: membership.membershipTypeId
      }))
  },
  async overdue (membership, args, { pgdb }) {
    if (!membership.active || !membership.latestPaymentFailedAt) {
      return false
    }

    const latest = await pgdb.public.membershipPeriods.findFirst({
      membershipId: membership.id
    }, { fields: '"endDate"', orderBy: ['endDate desc'] })
    return !!(
      membership.active &&
      membership.latestPaymentFailedAt &&
      membership.latestPaymentFailedAt > latest.endDate
    )
  },
  async canProlong (membership, args, context) {
    const { pgdb } = context

    return createMembershipCache(membership, 'canProlong', context)
      .cache(async () => {
        const user = await pgdb.public.users.findOne({ id: membership.userId })
        const customPackages = await getCustomPackages({ user, pgdb })

        const pickedMembershipIds =
          customPackages.map(p => p.options.map(o => o.membership && o.membership.id))
        const prolongableMembershipIds =
          _(pickedMembershipIds).flattenDeep().uniq().value().filter(Boolean)

        return prolongableMembershipIds.includes(membership.id)
      })
  },
  async endDate (membership, args, context) {
    const { pgdb } = context
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'endDate', context)
      .cache(async () => {
        const periods = await pgdb.public.membershipPeriods.find({
          membershipId: membership.id
        })

        if (periods.length < 1) {
          return null
        }

        return moment(getLastEndDate(periods))
      })
  },
  async graceEndDate (membership, args, context) {
    const { pgdb } = context
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'graceEndDate', context)
      .cache(async () => {
        const periods = await pgdb.public.membershipPeriods.find({
          membershipId: membership.id
        })

        if (periods.length < 1) {
          return null
        }

        return addInterval(
          getLastEndDate(periods),
          membership.graceInterval
        )
      })
  },
  async pledge (membership, args, { pgdb, user: me }) {
    const pledge =
      membership.pledge ||
      await pgdb.public.pledges.findOne({
        id: membership.pledgeId
      })

    if (membership.userId !== me.id && pledge.userId !== me.id) {
      Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])
    }

    return pledge
  },
  async periods (membership, args, { pgdb }) {
    return pgdb.public.membershipPeriods.find({
      membershipId: membership.id
    }, { orderBy: ['endDate desc'] })
  },
  async user (membership, args, { user: me, pgdb }) {
    const user = await pgdb.public.users.findOne({ id: membership.userId })

    return transformUser(user)
  },
  async cancellations ({ id, cancelReasons }, args, { user: me, pgdb }) {
    return pgdb.public.membershipCancellations.find(
      { membershipId: id },
      { orderBy: { createdAt: 'ASC' } }
    )
      .then(cancellations => cancellations
        .map(cancellation => ({
          ...cancellation,
          category: {
            type: cancellation.category
          }
        })
        )
      )
  }
}
