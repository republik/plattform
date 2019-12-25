const debug = require('debug')('crowdfundings:lib:scheduler:givers')
const moment = require('moment')
const Promise = require('bluebird')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const {
  DAYS_BEFORE_END_DATE: OWNERS_DAYS_BEFORE_END_DATE
} = require('./owners')

const {
  PARKING_USER_ID
} = process.env

const DAYS_BEFORE_END_DATE = 45
const MAX_DAYS_BEFORE_END_DATE = 33
const EXCLUDE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

const formatDate = (date) =>
  moment(date).format('YYYYMMDD')

const getUsers = async ({ now }, { pgdb }) => {
  const minEndDate = moment(now)
    .add(MAX_DAYS_BEFORE_END_DATE, 'days')
    .startOf('day')
  const maxEndDate = moment(now)
    .add(DAYS_BEFORE_END_DATE, 'days')
    .endOf('day')
  debug('get users for: %o', {
    minEndDate: minEndDate.toISOString(),
    maxEndDate: maxEndDate.toISOString()
  })

  const users = await pgdb.query(`
    WITH dormant_membership_user_ids AS (
      SELECT
        DISTINCT(m."userId") as "userId"
      FROM
        memberships m
      JOIN
        pledges p
        ON m."pledgeId" = p.id
      JOIN
        packages pkg
        ON p."packageId" = pkg.id
      WHERE
        m.id NOT IN (SELECT "membershipId" FROM "membershipPeriods") AND --no period
        pkg.name != 'ABO_GIVE' AND
        m."userId" != :PARKING_USER_ID AND
        m."membershipTypeId" IN (
          SELECT id FROM "membershipTypes" WHERE name = ANY('{${EXCLUDE_MEMBERSHIP_TYPES.join(',')}}')
        )
    ), givers AS (
      SELECT
        u.id AS "userId",
        u.email AS "email",
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
        u.id != :PARKING_USER_ID AND
        u.id NOT IN (SELECT "userId" FROM dormant_membership_user_ids)
      GROUP BY
        1, 2, 3
      ORDER BY
       1, 4
    )
      SELECT
        "userId",
        "email",
        json_agg("membershipId") as "membershipIds",
        json_agg(DISTINCT("lastEndDate")) as "lastEndDates",
        min("lastEndDate") as "minLastEndDate"
      FROM
        givers
      WHERE
        "lastEndDate" > :minEndDate AND
        "lastEndDate" < :maxEndDate
      GROUP BY
        1, 2
  `, {
    PARKING_USER_ID,
    minEndDate,
    maxEndDate
  })

  debug('found %d users', users.length)
  return users
}

const inform = async (args, context) => {
  const users = await getUsers(args, context)

  return Promise.map(
    users,
    async ({
      userId,
      email,
      membershipIds,
      lastEndDates,
      minLastEndDate
    }) => {
      const minLastEndDateDiff = moment(minLastEndDate)
        .diff(moment(), 'days')
      const informClaimersDays =
        minLastEndDateDiff - OWNERS_DAYS_BEFORE_END_DATE

      const templatePayload = await context.mail.prepareMembershipGiversProlongNotice({
        userId,
        membershipIds,
        informClaimersDays
      }, context)

      return sendMailTemplate(
        templatePayload,
        context,
        {
          onceFor: {
            type: 'membership_giver_prolong_notice',
            userId,
            keys: lastEndDates
              .map(date => `lastEndDate:${formatDate(date)}`)
          }
        }
      )
    },
    { concurrency: 2 }
  )
}

module.exports = {
  inform
}
