const debug = require('debug')('crowdfundings:lib:scheduler:owners')
const moment = require('moment')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')

const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../graphql/resolvers/User')

const { suggest: autoPaySuggest } = require('../AutoPay')

const mailings = require('./owners/mailings')
const charging = require('./owners/charging')

const {
  PARKING_USER_ID
} = process.env

const STATS_INTERVAL_SECS = 3
const DAYS_BEFORE_END_DATE = 29

const getMinEndDate = (now, daysBeforeEndDate) =>
  moment(now)
    .subtract(6, 'hours')
    .subtract(30, 'minutes')
    .add(daysBeforeEndDate, 'days')
    .startOf('day')

const getMaxEndDate = (now, daysBeforeEndDate) =>
  moment(now)
    .subtract(6, 'hours')
    .subtract(30, 'minutes')
    .add(daysBeforeEndDate, 'days')
    .endOf('day')

const createBuckets = (now) => [
  {
    name: 'membership_owner_prolong_notice',
    endDate: {
      min: getMinEndDate(now, 13),
      max: getMaxEndDate(now, DAYS_BEFORE_END_DATE)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (
          membershipAutoPay === true && (
            !autoPay ||
            (autoPay && userId !== autoPay.userId)
          )
        )
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice'
    },
    handler: mailings
  },
  {
    name: 'membership_owner_prolong_notice_7',
    endDate: {
      min: getMinEndDate(now, 3),
      max: getMaxEndDate(now, 7)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (
          membershipAutoPay === true && (
            !autoPay ||
            (autoPay && userId !== autoPay.userId)
          )
        )
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_7'
    },
    handler: mailings
  },
  {
    name: 'membership_owner_prolong_notice_0',
    endDate: {
      min: getMinEndDate(now, -3),
      max: getMaxEndDate(now, 0)
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return ['ABO'].includes(membershipType) && (
        membershipAutoPay === false ||
        (
          membershipAutoPay === true && (
            !autoPay ||
            (autoPay && userId !== autoPay.userId)
          )
        )
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_0'
    },
    handler: mailings
  },
  {
    name: 'membership_owner_autopay_notice',
    endDate: {
      min: moment(now).add(1, 'days'),
      max: moment(now).add(10, 'days')
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
    },
    payload: {
      templateName: 'membership_owner_autopay_notice'
    },
    handler: mailings
  },
  {
    name: 'membership_owner_autopay',
    endDate: {
      min: moment(now).add(-14, 'days'),
      max: moment(now).add(0, 'days')
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
    },
    handler: charging // Rate limit amount of requests in some manner...
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

  const buckets = createBuckets(now).map(bucket => ({ ...bucket, users: [] }))
  buckets.forEach(bucket => debug('bucket: %o', {
    ...bucket,
    endDate: {
      min: bucket.endDate.min.toISOString(),
      max: bucket.endDate.max.toISOString()
    }
  }))

  await Promise.each(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        { ignoreAutoPayFlag: true },
        { ...context, user }
      )
        .then(date => date && moment(date))

      stats.numNeedProlongProgress++

      if (prolongBeforeDate) {
        const results = await Promise.map(
          buckets,
          async bucket => {
            if (prolongBeforeDate.isBetween(bucket.endDate.min, bucket.endDate.max)) {
              if (!user.autoPay) {
                user.autoPay = await autoPaySuggest(user.membershipId, pgdb)
              }

              if (bucket.predicate(user)) {
                bucket.users.push({ user, prolongBeforeDate })
                return true
              }
            }

            return false
          },
          { concurrency: 10 }
        )
          .catch(e => { console.warn(e) })

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

const run = async (args, context) => {
  const buckets = await getBuckets(args, context)
  buckets.forEach(bucket => debug('bucket: %o', {
    ...bucket,
    endDate: {
      min: bucket.endDate.min.toISOString(),
      max: bucket.endDate.max.toISOString()
    },
    users: bucket.users.length
  }))

  await Promise.map(
    buckets,
    bucket => Promise.each(
      bucket.users,
      user => bucket.handler(user, bucket, context)
    )
  )
}

module.exports = {
  DAYS_BEFORE_END_DATE,
  run
}
