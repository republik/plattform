const debug = require('debug')('crowdfundings:lib:scheduler:winbacks')
const moment = require('moment')
const Promise = require('bluebird')

const { send } = require('../mailLog')

const {
  PARKING_USER_ID
} = process.env

const DAYS_AFTER_CANCELLATION = 4
const MAX_DAYS_AFTER_CANCELLATION = 30

const getCancellations = async ({ now }, { pgdb }) => {
  const maxCancelledAt = moment(now)
    .subtract(DAYS_AFTER_CANCELLATION, 'days')
    .endOf('day')
  const minCancelledAt = moment(now)
    .subtract(MAX_DAYS_AFTER_CANCELLATION, 'days')
    .startOf('day')
  debug('get users for: %o', {maxCancelledAt, minCancelledAt})

  const cancellations = await pgdb.query(`
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
      mc.category = ANY('{EDITORIAL, NO_TIME, TOO_EXPENSIVE}') AND
      mc."suppressNotifications" = false AND
      mc."revokedAt" IS NULL AND
      m."membershipTypeId" IN (
        SELECT id FROM "membershipTypes" WHERE name = ANY('{ABO, BENEFACTOR_ABO}')
      ) AND
      mc."createdAt" > :minCancelledAt AND
      mc."createdAt" < :maxCancelledAt
  `, {
    PARKING_USER_ID,
    minCancelledAt,
    maxCancelledAt
  })

  debug('found %d cancellations', cancellations.length)
  return cancellations
}

const inform = async (args, context) => {
  const _cancellations = await getCancellations(args, context)
  // TODO remove
  const cancellations = _cancellations.slice(0, 2)

  return Promise.map(
    cancellations,
    async ({
      userId,
      email,
      membershipId,
      cancellationCategory,
      cancelledAt,
      cancellationId
    }) => {
      const templatePayload = await context.mail.prepareMembershipWinback({
        userId,
        membershipId,
        cancellationCategory,
        cancelledAt
      }, context)
      await send(
        {
          type: `membership_winback`,
          userId,
          email,
          info: {
            membershipId, // a user is only tried to winback once
            membershipCancellationId: cancellationId,
            templatePayload
          }
        },
        () => context.mail.sendMailTemplate(templatePayload),
        context
      )
    },
    { concurrency: 2 }
  )
}

module.exports = {
  inform
}
