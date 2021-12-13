const debug = require('debug')('crowdfundings:lib:scheduler:owners')
const moment = require('moment')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  publishMonitor,
} = require('@orbiting/backend-modules-republik/lib/slack')

const {
  prolongBeforeDate: getProlongBeforeDate,
} = require('../../graphql/resolvers/User')

const { suggest: autoPaySuggest } = require('../AutoPay')

const mailings = require('./owners/mailings')
const charging = require('./owners/charging')

const { PARKING_USER_ID, MEMBERSHIP_SCHEDULER_USER_LIMIT } = process.env

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
      max: getMaxEndDate(now, DAYS_BEFORE_END_DATE),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_prolong_notice_7',
    endDate: {
      min: getMinEndDate(now, 3),
      max: getMaxEndDate(now, 7),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_7',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_prolong_notice_0',
    endDate: {
      min: getMinEndDate(now, -3),
      max: getMaxEndDate(now, 0),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_0',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_prolong_abo_give_months_notice_0',
    endDate: {
      min: getMinEndDate(now, -3),
      max: getMaxEndDate(now, 0),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        membershipType === 'ABO_GIVE_MONTHS' &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_abo_give_months_notice_0',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_prolong_winback_7',
    endDate: {
      min: getMinEndDate(now, -10),
      max: getMaxEndDate(now, -7),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    payload: {
      templateName: 'membership_owner_prolong_winback_7',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_autopay_notice',
    endDate: {
      min: moment(now).add(1, 'days'),
      max: moment(now).add(10, 'days'),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
      )
    },
    payload: {
      templateName: 'membership_owner_autopay_notice',
    },
    handler: mailings,
  },
  {
    name: 'membership_owner_autopay',
    endDate: {
      min: moment(now).add(-14, 'days'),
      max: moment(now).add(0, 'days'),
    },
    predicate: ({ id: userId, membershipType, membershipAutoPay, autoPay }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
      )
    },
    handler: charging, // Rate limit amount of requests in some manner...
  },
]

const pickAdditionals = (user) => ({
  ...user,
  membershipId: user._raw.membershipId,
  membershipSequenceNumber: user._raw.membershipSequenceNumber,
  membershipGraceInterval: user._raw.membershipGraceInterval,
  membershipAutoPay: user._raw.membershipAutoPay,
  membershipType: user._raw.membershipType,
})

const creatMaybeAppendProlongBeforeDate = (context) => async (user) => ({
  ...user,
  prolongBeforeDate: await getProlongBeforeDate(
    user,
    { ignoreAutoPayFlag: true },
    { ...context, user },
  ).then((date) => date && moment(date)),
})

const hasProlongBeforeDate = (user) => user.prolongBeforeDate

const createHandleFn = (buckets, context) => async (rows, count, pgdb) => {
  const users = await Promise.map(
    rows.map(transformUser).map(pickAdditionals),
    creatMaybeAppendProlongBeforeDate(context),
    { concurrency: 10 },
  ).filter(hasProlongBeforeDate)

  debug({ count, rows: rows.length, withProlongBeforeDate: users.length })

  await Promise.mapSeries(users, async (user) =>
    Promise.map(
      buckets,
      async (bucket) => {
        if (
          user.prolongBeforeDate.isBetween(
            bucket.endDate.min,
            bucket.endDate.max,
          )
        ) {
          if (user.membershipAutoPay && user.autoPay === undefined) {
            user.autoPay = await autoPaySuggest(user.membershipId, pgdb)
            if (!user.autoPay) {
              user.membershipAutoPay = false
              setAutoPayToFalse({
                user,
                membershipId: user.membershipId,
                pgdb,
              })
            }
          }

          if (bucket.predicate(user)) {
            await bucket.handler(
              {
                user,
                prolongBeforeDate: user.prolongBeforeDate,
              },
              bucket,
              context,
            )
          }
        }
      }
    ).catch((e) => {
      console.warn(e)
    }),
  )
}

const run = async (args, context) => {
  const { now } = args
  const { pgdb } = context

  const buckets = createBuckets(now)

  await pgdb.queryInBatches(
    { handleFn: createHandleFn(buckets, context), size: 1000 },
    `
      SELECT
        -- user
        u.*,

        -- additionals
        m.id AS "membershipId",
        m."sequenceNumber" AS "membershipSequenceNumber",
        m."graceInterval" AS "membershipGraceInterval",
        m."autoPay" AS "membershipAutoPay",
        mt.name AS "membershipType"
      FROM
        memberships m
      JOIN
        users u ON m."userId" = u.id
      JOIN
        "membershipTypes" mt ON m."membershipTypeId" = mt.id
      WHERE
        m."userId" != :PARKING_USER_ID
        AND m.active = true
        AND m.renew = true
      ORDER BY RANDOM()
      ${
        MEMBERSHIP_SCHEDULER_USER_LIMIT
          ? `LIMIT ${MEMBERSHIP_SCHEDULER_USER_LIMIT}`
          : ''
      }
      `,
    { PARKING_USER_ID },
  )

  debug('Done.')
}

module.exports = {
  DAYS_BEFORE_END_DATE,
  run,
}

async function setAutoPayToFalse({ user, membershipId, pgdb }) {
  const message = `setAutoPayToFalse (membershipId: ${membershipId}) \`autoPay\` was set to \`false\` due to AutoPay.suggest missing data (e.g. no pledge or default credit card)\n{ADMIN_FRONTEND_BASE_URL}/users/${user.id}`
  console.info(message)
  await publishMonitor(user, message)

  await pgdb.public.memberships.updateOne(
    {
      id: membershipId,
    },
    {
      autoPay: false,
    },
  )
}
