const debug = require('debug')('crowdfundings:lib:scheduler:winbacks')
const moment = require('moment')
const Promise = require('bluebird')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { PARKING_USER_ID } = process.env

const DAYS_AFTER_CANCELLATION = 3
const MAX_DAYS_AFTER_CANCELLATION = 30

const CANCELLATION_CATEGORIES = [
  // Temporarily disabled
  // 'NO_TIME',
  // 'PAPER',
  'TOO_EXPENSIVE',
  'NO_MONEY',
]
const MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

const TYPE = 'membership_winback'

const getCancelledAtMinMax = (now = moment()) => {
  const maxCancelledAt = moment(now)
    .subtract(DAYS_AFTER_CANCELLATION, 'days')
    .endOf('day')
  const minCancelledAt = moment(now)
    .subtract(MAX_DAYS_AFTER_CANCELLATION, 'days')
    .startOf('day')
  return { maxCancelledAt, minCancelledAt }
}

const winbackCanBeSentForCancellationDate = (createdAt) => {
  const { minCancelledAt } = getCancelledAtMinMax()
  return moment(createdAt).isAfter(moment(minCancelledAt).add(1, 'days'))
}

const getCancellations = async ({ now }, { pgdb }) => {
  const { maxCancelledAt, minCancelledAt } = getCancelledAtMinMax(now)

  debug('get users for: %o', {
    maxCancelledAt: maxCancelledAt.toISOString(),
    minCancelledAt: minCancelledAt.toISOString(),
  })

  const cancellations = await pgdb.query(
    `
    SELECT
      u.id AS "userId",
      u.email AS "email",
      m.id AS "membershipId",
      mc.category as "cancellationCategory",
      mc."createdAt" AS "cancelledAt",
      mc.id AS "cancellationId"
    FROM
      "membershipCancellations" mc
    JOIN
      memberships m
      ON mc."membershipId" = m.id
    JOIN
      users u
      ON m."userId" = u.id
    WHERE
      u.id != :PARKING_USER_ID AND
      mc.category = ANY('{${CANCELLATION_CATEGORIES.join(',')}}') AND
      mc."suppressWinback" = false AND
      mc."revokedAt" IS NULL AND
      m."membershipTypeId" IN (
        SELECT id FROM "membershipTypes" WHERE name = ANY('{${MEMBERSHIP_TYPES.join(
          ',',
        )}}')
      ) AND
      mc."createdAt" > :minCancelledAt AND
      mc."createdAt" < :maxCancelledAt
  `,
    {
      PARKING_USER_ID,
      minCancelledAt,
      maxCancelledAt,
    },
  )

  debug('found %d cancellations', cancellations.length)
  return cancellations
}

const inform = async (args, context) => {
  const cancellations = await getCancellations(args, context)

  return Promise.map(
    cancellations,
    async ({
      userId,
      membershipId,
      cancellationCategory,
      cancelledAt,
      cancellationId,
    }) => {
      const otherActiveMembership = await hasUserOtherActiveMagazineAccess({ userId, membershipId, pgdb: context.pgdb })

      if (otherActiveMembership) {
        // if user came back with a new membership or subscription, don't send winback mail
        // this is very much an edge case, because winback mails are sent after the cancellation,
        // mostly when the membership is still active
        return
      }

      const templatePayload = await context.mail.prepareMembershipWinback(
        {
          userId,
          cancellationCategory,
          cancelledAt,
        },
        context,
      )
      return sendMailTemplate(templatePayload, context, {
        onceFor: {
          type: TYPE,
          userId,
        },
        info: {
          // a user is only tried to winback once
          // thus membershipId not in onceFor
          membershipId,
          membershipCancellationId: cancellationId,
        },
      })
    },
    { concurrency: 2 },
  )
}

const hasUserOtherActiveMagazineAccess = async ({ userId, membershipId, pgdb}) => {
  const res = await pgdb.queryOne(
    `SELECT
        (
          (
            SELECT COUNT(*) FROM payments.subscriptions s
            WHERE s."userId" = :userId and s.status not in ('paused', 'canceled', 'incomplete')
          )
          +
          (
            SELECT COUNT(*) FROM public.memberships m
            WHERE m."userId" = :userId and m.active = true
            and m.id != :membershipId
          )
        ) AS count`,
    { userId: userId, membershipId: membershipId},
  )
  return res?.count > 0
}

module.exports = {
  TYPE,
  winbackCanBeSentForCancellationDate,
  inform,
}
