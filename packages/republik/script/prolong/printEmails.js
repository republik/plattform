#!/usr/bin/env node
/**
 * This script print all emails that need to prolong before a certain date
 * - can be used to tag people on MailChimp
 * - uses prolongBeforeDate which respects cancellations, sleeping memberships and pending pledges
 *
 * Usage:
 * cd servers/republik
 * script/prolong/printEmails.js 2019-01-16
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const moment = require('moment')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../modules/crowdfundings/graphql/resolvers/User')

const {
  PARKING_USER_ID
} = process.env

const STATS_INTERVAL_SECS = 2
const PROLONG_BEFORE_DATE = moment(process.argv[2] || '2019-01-16')

const me = {
  roles: ['admin']
}

console.log('printEmails for prolong before', PROLONG_BEFORE_DATE.format('DD.MM.YYYY'))

PgDb.connect().then(async pgdb => {
  // load users with a membership
  const users = await pgdb.query(`
    SELECT
      DISTINCT(u.*)
    FROM
      users u
    JOIN
      memberships m
      ON m."userId" = u.id
    WHERE
      u.id != :PARKING_USER_ID
  `, {
    PARKING_USER_ID
  })
    .then(users => users
      .map(user => transformUser(user))
    )
  console.log(`investigating ${users.length} users`)

  const stats = {
    numProlong: 0,
    numProlongProgress: 0
  }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const prolongUsers = await Promise.filter(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        {},
        { pgdb, user: me }
      )
      stats.numProlongProgress += 1
      if (prolongBeforeDate && moment(prolongBeforeDate).isBefore(PROLONG_BEFORE_DATE)) {
        stats.numProlong += 1
        return true
      }
      return false
    },
    { concurrency: 10 }
  )
  delete stats.numProlongProgress
  console.log(`${prolongUsers.length} users can prolong before`, PROLONG_BEFORE_DATE.format('DD.MM.YYYY'))

  clearInterval(statsInterval)

  console.log('---')
  console.log(prolongUsers.map(user => user.email).join('\n'))
  console.log('---')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
