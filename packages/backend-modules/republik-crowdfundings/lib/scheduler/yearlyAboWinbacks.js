const debug = require('debug')('crowdfundings:lib:scheduler:yearlyAboWinbacks')
const moment = require('moment')
const Promise = require('bluebird')

const { transformUser, Roles } = require('@orbiting/backend-modules-auth')

const mailings = require('./owners/mailings')

const { getLastEndDate } = require('../utils')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

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
    name: 'membership_owner_prolong_yearly_abo_winback_16',
    prolongBefore: {
      minDate: getMinEndDate(now, -21),
      maxDate: getMaxEndDate(now, -16),
    },
    payload: {
      templateName: 'membership_owner_prolong_yearly_abo_winback_16',
    },
    predicateFn: () => {
      return true
    },
    handleFn: mailings,
  },
  {
    name: 'membership_owner_prolong_yearly_abo_winback_24',
    prolongBefore: {
      minDate: getMinEndDate(now, -28),
      maxDate: getMaxEndDate(now, -24),
    },
    payload: {
      templateName: 'membership_owner_prolong_yearly_abo_winback_24',
    },
    predicateFn: () => {
      return true
    },
    handleFn: mailings,
  },
]

const createMaybeAppendLastEndDate = (context) => async (user) => ({
  ...user,
  prolongBeforeDate: await getLastEndDateOfYearlyAboUserMemberships(user, {
    ...context,
    user,
  }).then((date) => date && moment(date)),
})

const getLastEndDateOfYearlyAboUserMemberships = async (user, context) => {
  const { pgdb, user: me } = context
  Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

  const memberships = await pgdb.public.memberships.find({
    userId: user.id,
  })

  const hasActiveMembership = await hasUserActiveMembership(user, pgdb)
  if (hasActiveMembership) {
    debug('already has active membership, no winback')
    return null
  }

  const membershipPeriods = memberships.length
    ? await pgdb.public.membershipPeriods.find({
        membershipId: memberships.map((membership) => membership.id),
      })
    : []

  if (membershipPeriods.length === 0) {
    debug('no membershipPeriods found, no winback')
    return null
  }

  return moment(getLastEndDate(membershipPeriods))
}

const hasProlongBeforeDate = (user) => user.prolongBeforeDate

const createUserJobs = (jobs, context) => async (user) =>
  Promise.each(jobs, async (job) => {
    try {
      const { prolongBefore, payload, predicateFn, handleFn } = job

      if (
        user.prolongBeforeDate.isBetween(
          prolongBefore.minDate,
          prolongBefore.maxDate,
        )
      ) {
        if (predicateFn(user)) {
          await handleFn(user, payload, context)
        }
      }
    } catch (error) {
      console.error('scheduler yearly_abo winbacks, job failed', {
        error,
        job,
        user: user.id,
      })
    }
  })

const createHandleFn = (jobs, context) => async (rows, count) => {
  const users = await Promise.map(
    rows.map(transformUser).map(pickAdditionals),
    createMaybeAppendLastEndDate(context),
    { concurrency: 10 },
  ).filter(hasProlongBeforeDate)

  debug({ count, rows: rows.length, withProlongBeforeDate: users.length })

  await Promise.map(users, createUserJobs(jobs, context), {
    concurrency: Number(MEMBERSHIP_SCHEDULER_CONCURRENCY),
  })
}

const pickAdditionals = (user) => ({
  ...user,
  membershipGraceInterval: user._raw.membershipGraceInterval,
  membershipType: user._raw.membershipType,
})

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
        MAX(m."graceInterval") "membershipGraceInterval",
        MAX(mt.name) "membershipType"

      FROM memberships m
      JOIN users u
        ON m."userId" = u.id
      JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      WHERE
        m."userId" != :PARKING_USER_ID
        AND m.active = false
        AND m.renew = true
        AND mt.name = :MT_NAME
      GROUP BY 1
      ORDER BY RANDOM()
      ${
        MEMBERSHIP_SCHEDULER_USER_LIMIT
          ? `LIMIT ${MEMBERSHIP_SCHEDULER_USER_LIMIT}`
          : ''
      }
      `,
    { PARKING_USER_ID, MT_NAME: 'YEARLY_ABO' },
  )

  debug('Done.')
}

module.exports = {
  DAYS_BEFORE_END_DATE,
  run,
}
