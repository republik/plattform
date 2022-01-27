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

const {
  PARKING_USER_ID,
  MEMBERSHIP_SCHEDULER_USER_LIMIT,
  MEMBERSHIP_SCHEDULER_CONCURRENCY = 10,
} = process.env

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

/**
 * Creates an array of jobs. A job maybe sending an email or charging
 * a user. Each user is check whether a job should be run.
 *
 * 1) Is {user.prolongBeforeDate} between {job.prolongBefore.minDate}
 *    and {job.prolongBefore.maxDate}?
 *
 * 2) Does user pass {job.predicateFn}?
 *
 * 3) Then run {job.handleFn}
 *
 */
const createJobs = (now) => [
  /*
  {
    name: 'some-example',
    prolongBefore: {
      minDate: moment(2021-12-12),
      maxDate: moment(2021-12-24)
    },
    payload: { seed: Math.random() },
    predicateFn:
      (user) =>
        user.membershipType === 'ABO'
    handleFn:
      async (user, payload, context) => {
        await postSomewhere(
          'ABO job',
          payload.seed,
          user.firstName
        )
      }
  },
  */
  {
    name: 'membership_owner_prolong_notice',
    prolongBefore: {
      minDate: getMinEndDate(now, 13),
      maxDate: getMaxEndDate(now, DAYS_BEFORE_END_DATE),
    },
    payload: {
      templateName: 'membership_owner_prolong_notice',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_prolong_notice_7',
    prolongBefore: {
      minDate: getMinEndDate(now, 3),
      maxDate: getMaxEndDate(now, 7),
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_7',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_prolong_notice_0',
    prolongBefore: {
      minDate: getMinEndDate(now, -3),
      maxDate: getMaxEndDate(now, 0),
    },
    payload: {
      templateName: 'membership_owner_prolong_notice_0',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_prolong_abo_give_months_notice_0',
    prolongBefore: {
      minDate: getMinEndDate(now, -3),
      maxDate: getMaxEndDate(now, 0),
    },
    payload: {
      templateName: 'membership_owner_prolong_abo_give_months_notice_0',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        membershipType === 'ABO_GIVE_MONTHS' &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_prolong_winback_7',
    prolongBefore: {
      minDate: getMinEndDate(now, -10),
      maxDate: getMaxEndDate(now, -7),
    },
    payload: {
      templateName: 'membership_owner_prolong_winback_7',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        (membershipAutoPay === false ||
          (membershipAutoPay === true &&
            (!autoPay || (autoPay && userId !== autoPay.userId))))
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_autopay_notice',
    prolongBefore: {
      minDate: moment(now).add(1, 'days'),
      maxDate: moment(now).add(10, 'days'),
    },
    payload: {
      templateName: 'membership_owner_autopay_notice',
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
      )
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_autopay',
    prolongBefore: {
      minDate: moment(now).add(-14, 'days'),
      maxDate: moment(now).add(0, 'days'),
    },
    predicateFn: ({
      id: userId,
      membershipType,
      membershipAutoPay,
      autoPay,
    }) => {
      return (
        ['ABO', 'BENEFACTOR_ABO'].includes(membershipType) &&
        membershipAutoPay === true &&
        autoPay &&
        userId === autoPay.userId
      )
    },
    handleFn: charging,
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

const createMaybeAppendProlongBeforeDate = (context) => async (user) => ({
  ...user,
  prolongBeforeDate: await getProlongBeforeDate(
    user,
    { ignoreAutoPayFlag: true },
    { ...context, user },
  ).then((date) => date && moment(date)),
})

const hasProlongBeforeDate = (user) => user.prolongBeforeDate

const createUserJobs = (jobs, context) => async (user) =>
  Promise.each(jobs, async (job) => {
    try {
      const { pgdb } = context
      const { prolongBefore, payload, predicateFn, handleFn } = job

      if (
        user.prolongBeforeDate.isBetween(
          prolongBefore.minDate,
          prolongBefore.maxDate,
        )
      ) {
        if (user.membershipAutoPay) {
          user.autoPay = await autoPaySuggest(user.membershipId, pgdb)

          if (!user.autoPay) {
            await setAutoPayToFalse({
              user,
              membershipId: user.membershipId,
              pgdb,
            })
          }
        }

        if (predicateFn(user)) {
          await handleFn(user, payload, context)
        }
      }
    } catch (error) {
      console.error('scheduler owners, job failed', {
        error,
        job,
        user: user.id,
      })
    }
  })

const createHandleFn = (jobs, context) => async (rows, count) => {
  const users = await Promise.map(
    rows.map(transformUser).map(pickAdditionals),
    createMaybeAppendProlongBeforeDate(context),
    { concurrency: 10 },
  ).filter(hasProlongBeforeDate)

  debug({ count, rows: rows.length, withProlongBeforeDate: users.length })

  await Promise.map(users, createUserJobs(jobs, context), {
    concurrency: Number(MEMBERSHIP_SCHEDULER_CONCURRENCY),
  })
}

const run = async (args, context) => {
  const { now } = args
  const { pgdb } = context

  const jobs = createJobs(now)

  await pgdb.queryInBatches(
    { handleFn: createHandleFn(jobs, context), size: 1000 },
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

      FROM memberships m
      JOIN users u
        ON m."userId" = u.id
      JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
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
