const debug = require('debug')('crowdfundings:lib:scheduler:owners')
const moment = require('moment')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { applyPgInterval: { add: addInterval } } = require('@orbiting/backend-modules-utils')

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
    endDate: [
      getMinEndDate(now, 22),
      getMaxEndDate(now, DAYS_BEFORE_END_DATE)
    ],
    conditions: {
      membershipType: ['ABO'],
      autoPay: false
    },
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_7',
    endDate: [
      getMinEndDate(now, 5),
      getMaxEndDate(now, 7)
    ],
    conditions: {
      membershipType: ['ABO'],
      autoPay: false
    },
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_0',
    endDate: [
      getMinEndDate(now, -3),
      getMaxEndDate(now, 0)
    ],
    conditions: {
      membershipType: ['ABO'],
      autoPay: false
    },
    users: []
  },
  {
    templateName: 'membership_owner_autopay_notice_5',
    endDate: [
      moment(now).add(1, 'days'),
      moment(now).add(5, 'days')
    ],
    conditions: {
      membershipType: ['ABO', 'BENEFACTOR_ABO'],
      autoPay: true
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
  buckets.forEach(bucket => debug('bucket %O', bucket))

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
        const dropped = buckets.some(bucket => {
          // Don't add user to bucket if user.membershipType does not equal
          // any of memberships listed in bucket.onlyMembershipTypes.
          if (
            bucket.conditions.membershipType &&
            !bucket.conditions.membershipType.includes(user.membershipType)
          ) {
            return false
          }

          // Don't add user to bucket if user.membershipAutopay does not equal
          // autoPay flag
          if (
            [true, false].includes(bucket.conditions.autoPay) &&
            bucket.conditions.autoPay !== user.membershipAutoPay
          ) {
            return false
          }

          // Add user to bucket if prolongBeforeDate is between
          // bucket.minEndDate and bucket.maxEndDate
          if (
            prolongBeforeDate.isAfter(bucket.endDate[0]) &&
            prolongBeforeDate.isBefore(bucket.endDate[1])
          ) {
            bucket.users.push({
              user,
              prolongBeforeDate
            })
            return true
          }
          return false
        })
        if (dropped) {
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
  buckets.forEach(bucket => debug('bucket: %o', { ...bucket, users: bucket.users.length }))

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
