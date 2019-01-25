const { transformUser, Roles } = require('@orbiting/backend-modules-auth')
const moment = require('moment')
const _ = require('lodash')

const { getLastEndDate } = require('../../lib/utils')
const { getCustomPackages } = require('../../lib/User')
const createCache = require('../../lib/cache')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // 1 day

const createMembershipCache = (membership, prop) => {
  return createCache({
    prefix: `User:${membership.userId}`,
    key: `membership:${membership.id}:${prop}`,
    ttl: QUERY_CACHE_TTL_SECONDS
  })
}

module.exports = {
  async type (membership, args, { pgdb }) {
    return createMembershipCache(membership, 'type')
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
    }, {fields: '"endDate"', orderBy: ['endDate desc']})
    return !!(
      membership.active &&
      membership.latestPaymentFailedAt &&
      membership.latestPaymentFailedAt > latest.endDate
    )
  },
  async needsProlong (membership, args, { pgdb, user: me }) {
    // Prolong not needed if a) membership is inactive, b) membership is not set
    // to be renewed or c) membership is set to "auto pay".
    if (!membership.active || !membership.renew || membership.autoPay) {
      return false
    }

    return createMembershipCache(membership, 'needsProlong')
      .cache(async () => {
        const user = await pgdb.public.users.findOne({ id: membership.userId })
        const customPackages = await getCustomPackages({ user, pgdb })

        const pickedMembershipIds =
          customPackages.map(p => p.options.map(o => o.membership.id))
        const prolongableMembershipIds =
          _(pickedMembershipIds).flattenDeep().uniq().value()

        return prolongableMembershipIds.includes(membership.id)
      })
  },
  async endDate (membership, args, { pgdb, user: me }) {
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'endDate')
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
  async graceEndDate (membership, args, { pgdb, user: me }) {
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'graceEndDate')
      .cache(async () => {
        const periods = await pgdb.public.membershipPeriods.find({
          membershipId: membership.id
        })

        if (periods.length < 1) {
          return null
        }

        const graceEndDate = moment(getLastEndDate(periods))
        Object.keys(membership.gracePeriodInterval).forEach(key => {
          graceEndDate.add(membership.gracePeriodInterval[key], key)
        })

        return graceEndDate
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
    }, {orderBy: ['endDate desc']})
  },
  async user (membership, args, { user: me, pgdb }) {
    const user = await pgdb.public.users.findOne({ id: membership.userId })

    return transformUser(user)
  },
  async cancellations ({ id, cancelReasons }, args, { user: me, pgdb }) {
    return pgdb.public.membershipCancellations.find({
      membershipId: id
    })
      .then(cancellations => cancellations.map(cancellation => ({
        ...cancellation,
        category: {
          type: cancellation.category
        }
      })))
  }
}
