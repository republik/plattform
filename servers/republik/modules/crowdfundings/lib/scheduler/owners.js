const debug = require('debug')('crowdfundings:lib:scheduler:owners')
const moment = require('moment')
const Promise = require('bluebird')
const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../graphql/resolvers/User')
const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const {
  PARKING_USER_ID
} = process.env

const STATS_INTERVAL_SECS = 3
const me = {
  roles: ['admin']
}

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
    minEndDate: getMinEndDate(now, 22),
    maxEndDate: getMaxEndDate(now, DAYS_BEFORE_END_DATE),
    onlyMembershipTypes: ['ABO'],
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_7',
    minEndDate: getMinEndDate(now, 5),
    maxEndDate: getMaxEndDate(now, 7),
    onlyMembershipTypes: ['ABO'],
    users: []
  },
  {
    templateName: 'membership_owner_prolong_notice_0',
    minEndDate: getMinEndDate(now, -2),
    maxEndDate: getMaxEndDate(now, 0),
    users: []
  }
]

const getBuckets = async ({ now }, { pgdb }) => {
  // load users with a membership
  const users = await pgdb.query(`
    SELECT
      u.*,
      json_agg(DISTINCT m.id) AS "membershipIds",
      json_agg(DISTINCT m."sequenceNumber") AS "membershipSequenceNumbers",
      json_agg(DISTINCT mt.name) AS "membershipTypes"
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
    GROUP BY 1
  `, {
    PARKING_USER_ID
  })
    .then(users => users
      .map(user => ({
        ...transformUser(user),
        membershipIds: user.membershipIds,
        membershipSequenceNumbers: user.membershipSequenceNumbers,
        membershipTypes: user.membershipTypes
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

  debug('buckets %O', buckets)

  await Promise.each(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        { ignoreClaimedMemberships: false },
        { pgdb, user: me }
      )
        .then(date => date && moment(date))

      stats.numNeedProlongProgress++

      if (prolongBeforeDate) {
        const dropped = buckets.some(bucket => {
          // Don't add user to bucket if user.membershipTypes does not contain
          // any of memberships listed in bucket.onlyMembershipTypes.
          if (
            bucket.onlyMembershipTypes &&
            !user.membershipTypes.find(
              type => bucket.onlyMembershipTypes.includes(type)
            )
          ) {
            return false
          }

          // Add user to bucket if prolongBeforeDate is between
          // bucket.minEndDate and bucket.maxEndDate
          if (
            prolongBeforeDate.isAfter(bucket.minEndDate) &&
            prolongBeforeDate.isBefore(bucket.maxEndDate)
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
  debug('buckets: %o', buckets.map(b => ({...b, users: b.users.length})))

  return Promise.each(
    buckets,
    bucket => Promise.each(
      bucket.users,
      async ({
        user,
        prolongBeforeDate
      }) => {
        const { id: userId } = user
        const templatePayload = await context.mail.prepareMembershipOwnerNotice({
          user,
          endDate: prolongBeforeDate,
          cancelUntilDate: moment(prolongBeforeDate).subtract(2, 'days'),
          graceEndDate: moment(prolongBeforeDate).add(14, 'days'),
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
