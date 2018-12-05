const debug = require('debug')('crowdfundings:lib:scheduler:givers')
const moment = require('moment')
const Promise = require('bluebird')

const { send } = require('../mailLog')

const {
  PARKING_USER_ID
} = process.env

const DAYS_BEFORE_END_DATE = 45
const MAX_DAYS_BEFORE_END_DATE = 40

const getUsers = async ({ now }, { pgdb }) => {
  const minEndDate = moment(now).add(MAX_DAYS_BEFORE_END_DATE, 'days').startOf('day')
  const maxEndDate = moment(now).add(DAYS_BEFORE_END_DATE, 'days').endOf('day')
  debug('get users for: %o', {minEndDate, maxEndDate})

  const users = await pgdb.query(`
    WITH givers AS (
      SELECT
        u.id AS "userId",
        m.id AS "membershipId",
        max(mp."endDate") AS "lastEndDate"
      FROM
        users u
      JOIN
        pledges p
        ON p."userId" = u.id
      JOIN
        memberships m
        ON
          m."pledgeId" = p.id AND
          m."userId" != u.id AND
          m."active" = true AND
          m."renew" = true
      JOIN
        "membershipPeriods" mp
        ON
          m.id = mp."membershipId"
      WHERE
        u.id != :PARKING_USER_ID
      GROUP BY
        1, 2
      ORDER BY
       1, 3
    )
      SELECT
        "userId" as "id",
        json_agg("membershipId") as "membershipIds"
      FROM
        givers
      WHERE
        "lastEndDate" > :minEndDate AND
        "lastEndDate" < :maxEndDate
      GROUP BY
        1
  `, {
    PARKING_USER_ID,
    minEndDate,
    maxEndDate
  })

  debug('found %d users', users.length)
  return users
}

const inform = async (args, context) => {
  const _users = await getUsers(args, context)
  // TODO remove
  const users = _users.slice(0, 1)

  await Promise.map(
    users,
    async (user) => {
      const userId = user.id
      const membershipIds = user.membershipIds
      const log = {
        type: `membership_givers_t-${DAYS_BEFORE_END_DATE}`,
        payload: {
          userId,
          membershipIds
        }
      }
      await send(
        log,
        () => context.mail.sendMembershipGiversProlongNotice({
          userId,
          membershipIds
        }, context),
        context
      )
    },
    { concurrency: 2 }
  )
}

module.exports = {
  inform
}
