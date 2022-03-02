const moment = require('moment')
const _ = require('lodash')
const resolverDebug = require('debug')('crowdfundings:resolver:Membership')

const { transformUser, Roles } = require('@orbiting/backend-modules-auth')
const {
  applyPgInterval: { add: addInterval },
} = require('@orbiting/backend-modules-utils')

const { getLastEndDate } = require('../../lib/utils')
const { getPackages } = require('../../lib/User')
const createCache = require('../../lib/cache')

const { DISABLE_RESOLVER_USER_CACHE } = process.env
const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // 1 day

const createMembershipCache = (membership, prop, context) =>
  createCache(
    {
      prefix: `User:${membership.userId}`,
      key: `membership:${membership.id}:${prop}`,
      ttl: QUERY_CACHE_TTL_SECONDS,
      disabled: DISABLE_RESOLVER_USER_CACHE,
    },
    context,
  )

const membershipResolver = {
  async type(membership, args, context) {
    return createMembershipCache(membership, 'type', context).cache(() =>
      context.loaders.MembershipType.byId.load(membership.membershipTypeId),
    )
  },

  async overdue(membership, args, context) {
    if (!membership.active) return false

    const periods = await membershipResolver.periods(membership, null, context)
    const hasPeriods = !!periods.length
    if (!hasPeriods) {
      console.trace(
        // Sanity check: an active membership should always have a period.
        `[data integrity] active membership without periode: ${membership.id}`,
      )
      return false
    }

    const latestPeriod = periods[0]
    const isLatestPeriodEnded = new Date(latestPeriod.endDate) < new Date()
    return isLatestPeriodEnded
  },

  async canProlong(membership, args, context) {
    const { pgdb } = context

    return createMembershipCache(membership, 'canProlong', context).cache(
      async () => {
        const user = await pgdb.public.users.findOne({ id: membership.userId })
        const customPackages = await getPackages({ pledger: user, pgdb })

        const pickedMembershipIds = customPackages.map((p) =>
          p.options.map((o) => o.membership && o.membership.id),
        )
        const prolongableMembershipIds = _(pickedMembershipIds)
          .flattenDeep()
          .uniq()
          .value()
          .filter(Boolean)

        return prolongableMembershipIds.includes(membership.id)
      },
    )
  },
  async endDate(membership, args, context) {
    const { pgdb } = context
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'endDate', context).cache(
      async () => {
        const periods = await pgdb.public.membershipPeriods.find({
          membershipId: membership.id,
        })

        if (periods.length < 1) {
          return null
        }

        return moment(getLastEndDate(periods))
      },
    )
  },
  async graceEndDate(membership, args, context) {
    const { pgdb } = context
    if (!membership.active) {
      return null
    }

    return createMembershipCache(membership, 'graceEndDate', context).cache(
      async () => {
        const periods = await pgdb.public.membershipPeriods.find({
          membershipId: membership.id,
        })

        if (periods.length < 1) {
          return null
        }

        return addInterval(getLastEndDate(periods), membership.graceInterval)
      },
    )
  },
  async pledge(membership, args, { pgdb, user: me }) {
    const pledge =
      membership.pledge ||
      (await pgdb.public.pledges.findOne({
        id: membership.pledgeId,
      }))

    if (membership.userId !== me.id && pledge.userId !== me.id) {
      Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])
    }

    return pledge
  },
  async periods(membership, args, { pgdb }) {
    const periods = await pgdb.public.membershipPeriods.find(
      { membershipId: membership.id },
      // the frontends rely on endDate DESC
      // - if you want to change this you'll need to adapt them
      { orderBy: { endDate: 'DESC' } },
    )

    const now = new Date()

    return periods.map((period) => ({
      ...period,
      isCurrent:
        membership.active && period.beginDate < now && period.endDate > now,
    }))
  },
  async user(membership, args, { user: me, pgdb }) {
    const user = await pgdb.public.users.findOne({ id: membership.userId })

    return transformUser(user)
  },
  async cancellations({ id, cancelReasons }, args, { user: me, pgdb }) {
    return pgdb.public.membershipCancellations
      .find({ membershipId: id }, { orderBy: { createdAt: 'ASC' } })
      .then((cancellations) =>
        cancellations.map((cancellation) => ({
          ...cancellation,
          category: {
            type: cancellation.category,
          },
        })),
      )
  },

  async giverName(membership, args, context) {
    const { loaders, user: me } = context
    const pledge =
      membership.pledge || (await loaders.Pledge.byId.load(membership.pledgeId))

    if (me && (membership.userId === me.id || pledge.userId === me.id)) {
      return loaders.User.byId.load(pledge.userId).then((u) => u && u.name)
    }
  },
  async messageToClaimers(membership, args, context) {
    const { loaders, user: me } = context
    const pledge =
      membership.pledge || (await loaders.Pledge.byId.load(membership.pledgeId))

    if (me && (membership.userId === me.id || pledge.userId === me.id)) {
      return pledge.messageToClaimers
    }
  },

  async autoPayIsMutable(membership, args, context) {
    if (!membership.active) {
      return false
    }
    if (!membership.renew) {
      return false
    }

    const type = await membershipResolver.type(membership, null, context)

    return type.interval === 'year'
  },

  async canAppendPeriod({ subscriptionId: stripeSubscriptionId, active }) {
    if (!active) {
      return false
    }

    // Here be dragons - manually adding a period is not possible on a membership
    // that has its periods generated by a remote service, e.g. Stripe.
    return !stripeSubscriptionId
  },

  async canReset(
    { id, active, renew, subscriptionId },
    { throwError = false },
    { t, pgdb },
  ) {
    const debug = resolverDebug.extend('canReset')

    if (!active) {
      debug('false, because membership is inactive')
      if (throwError) {
        throw new Error(t('api/membership/canReset/errorInactiveMembership'))
      }

      return false
    }

    if (!renew) {
      debug('false, because membership is not renewable')
      if (throwError) {
        throw new Error(t('api/membership/canReset/errorNotRenewable'))
      }
      return false
    }

    if (subscriptionId) {
      debug('false, because membership contains a subscription ID')
      if (throwError) {
        throw new Error(
          t('api/membership/canReset/errorContainsSubscriptionId'),
        )
      }
      return false
    }

    const periods = await pgdb.public.membershipPeriods.count({
      membershipId: id,
    })
    if (periods !== 1) {
      debug('false, because membership contains no or more than one period')
      if (throwError) {
        throw new Error(t('api/membership/canReset/errorTooFewOrManyPeriods'))
      }
      return false
    }

    debug('true')
    return true
  },
}

module.exports = membershipResolver
