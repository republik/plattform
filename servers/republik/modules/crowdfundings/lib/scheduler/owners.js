const debug = require('debug')('crowdfundings:lib:scheduler:owners')
const moment = require('moment')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { applyPgInterval: { add: addInterval }, findLastMembershipPledge } = require('@orbiting/backend-modules-utils')

const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../graphql/resolvers/User')

const {
  PARKING_USER_ID
} = process.env

const STATS_INTERVAL_SECS = 3
const DAYS_BEFORE_END_DATE = 29

const formatDate = (date) =>
  moment(date).format('YYYYMMDD')

const getMinEndDate = (now, daysBeforeEndDate) =>
  moment(now)
    .add(daysBeforeEndDate, 'days')
    .startOf('day')

const getMaxEndDate = (now, daysBeforeEndDate) =>
  moment(now)
    .add(daysBeforeEndDate, 'days')
    .endOf('day')

const createBuckets = (now) => [
  {
    templateName: 'membership_owner_prolong_notice',
    endDate: {
      min: getMinEndDate(now, 22),
      max: getMaxEndDate(now, DAYS_BEFORE_END_DATE)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, lastPledge: { pledge } }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (membershipAutoPay === true && userId !== pledge.userId)
      )
    },
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_7',
    endDate: {
      min: getMinEndDate(now, 5),
      max: getMaxEndDate(now, 7)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, lastPledge: { pledge } }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (membershipAutoPay === true && userId !== pledge.userId)
      )
    },
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_0',
    endDate: {
      min: getMinEndDate(now, -3),
      max: getMaxEndDate(now, 0)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, lastPledge: { pledge } }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (membershipAutoPay === true && userId !== pledge.userId)
      )
    },
    users: []
  },
  {
    templateName: 'membership_owner_autopay_notice_5',
    endDate: {
      min: moment(now).add(1, 'days'),
      max: moment(now).add(5, 'days')
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, lastPledge: { pledge } }) => {
      return ['ABO', 'BENEFACTOR'].includes(membershipType) &&
        membershipAutoPay === true &&
        userId === pledge.userId
    },
    users: []
  }
]

const getBuckets = async ({ now }, context) => {
  const { pgdb } = context

  /**
   * Load users with a membership.
   *
   * WARNING: The following query will only hold up if user has only one active
   * membership.
   *
   */
  const users = await pgdb.query(`
    SELECT
      u.*,
      m.id AS "membershipId",
      m."sequenceNumber" AS "membershipSequenceNumber",
      m."graceInterval" AS "membershipGraceInterval",
      m."autoPay" AS "membershipAutoPay",
      mt.name AS "membershipType"
    FROM
      memberships m
    INNER JOIN
      users u ON m."userId" = u.id
    INNER JOIN
      "membershipTypes" mt ON m."membershipTypeId" = mt.id
    WHERE
      m."userId" != :PARKING_USER_ID
      AND m.active = true
      AND m.renew = true
    ORDER BY RANDOM()
  `, {
    PARKING_USER_ID
  })
    .then(users => users
      .map(user => ({
        ...transformUser(user),
        membershipId: user.membershipId,
        membershipSequenceNumber: user.membershipSequenceNumber,
        membershipGraceInterval: user.membershipGraceInterval,
        membershipAutoPay: user.membershipAutoPay,
        membershipType: user.membershipType
      }))
    )
  debug(`investigating ${users.length} users for prolongBeforeDate`)

  const stats = {
    numNeedProlong: 0,
    numNeedProlongProgress: 0
  }
  const statsInterval = setInterval(() => {
    debug(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const buckets = createBuckets(now)
  buckets.forEach(bucket => debug('bucket: %o', {
    ...bucket,
    endDate: {
      min: bucket.endDate.min.toISOString(),
      max: bucket.endDate.max.toISOString()
    },
    users: bucket.users.length
  }))

  await Promise.each(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        { ignoreClaimedMemberships: false },
        { ...context, user }
      )
        .then(date => date && moment(date))

      stats.numNeedProlongProgress++

      if (prolongBeforeDate) {
        const results = await Promise.map(buckets, async bucket => {
          if (prolongBeforeDate.isBetween(bucket.endDate.min, bucket.endDate.max)) {
            if (!user.lastPledge) {
              user.lastPledge = await findLastMembershipPledge(user.membershipId, pgdb)
            }

            if (bucket.predicate(user)) {
              bucket.users.push({ user, prolongBeforeDate })
              return true
            }
          }

          return false
        }, { concurrency: 1 })

        if (results.some(Boolean)) {
          stats.numNeedProlong++
        }
      }
    },
    { concurrency: 10 }
  )
  delete stats.numNeedProlongProgress

  debug(stats)
  clearInterval(statsInterval)
  return buckets
}

const inform = async (args, context) => {
  const buckets = await getBuckets(args, context)
  buckets.forEach(bucket => debug('bucket: %o', {
    ...bucket,
    endDate: {
      min: bucket.endDate.min.toISOString(),
      max: bucket.endDate.max.toISOString()
    },
    users: bucket.users.length
  }))

  return Promise.each(
    buckets,
    bucket => Promise.each(
      bucket.users,
      async ({
        user,
        prolongBeforeDate
      }) => {
        const { id: userId, membershipGraceInterval } = user

        const templatePayload = await context.mail.prepareMembershipOwnerNotice({
          user,
          endDate: prolongBeforeDate,
          cancelUntilDate: moment(prolongBeforeDate).subtract(2, 'days'),
          graceEndDate: addInterval(
            prolongBeforeDate,
            membershipGraceInterval
          ),
          templateName: bucket.templateName
        }, context)
        return sendMailTemplate(
          templatePayload,
          context,
          {
            onceFor: {
              type: bucket.templateName,
              userId,
              keys: [`endDate:${formatDate(prolongBeforeDate)}`]
            }
          }
        )
      },
      { concurrency: 2 }
    ),
    { concurrency: 1 }
  )
}

module.exports = {
  DAYS_BEFORE_END_DATE,
  inform
}
