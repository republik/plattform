#!/usr/bin/env node
/**
 * This script adds to mailchimp members a CP_ATOKEN3
 * - if they need to prolong before 2019-01-16
 * - if they to not already have an owner notice key in the maillog
 *
 * Usage: (run from servers/republik)
 * node script/prolong/mcOwnerNotice.js [--dry]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const crypto = require('crypto')
const sleep = require('await-sleep')
const fetch = require('isomorphic-unfetch')
const moment = require('moment')
const uniqBy = require('lodash/uniqBy')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../modules/crowdfundings/graphql/resolvers/User')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID,
  PARKING_USER_ID
} = process.env

if (!MAILCHIMP_MAIN_LIST_ID) {
  throw new Error('missing MAILCHIMP_API_KEY, check your setup')
}

const STATS_INTERVAL_SECS = 2
const PROLONG_BEFORE_DATE = moment('2019-01-16')
const TOKEN_FIELD = 'CP_ATOKEN3'

const me = {
  roles: ['admin']
}

const MAILLOG_TYPE = 'membership_owner_prolong_notice'
const MAILLOG_KEYS = ['endDate:20190114', 'endDate:20190115']

const hash = (email) =>
  crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex')

const fetchAuthenticated = (method, url, request = {}) => {
  const options = {
    method,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')
    },
    ...request
  }
  return fetch(url, options)
    .then(r => r.json())
}

console.log('running mcOwnerNotice.js...')
PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  // load users with a membership and no membership_owner_prolong_notice
  const users = await pgdb.query(`
    SELECT
      DISTINCT(u.*)
    FROM
      users u
    JOIN
      memberships m
      ON m."userId" = u.id
    LEFT JOIN
      "mailLog" ml
      ON ml."userId" = u.id AND
         ml.type = :MAILLOG_TYPE AND
         ml."keys" && :MAILLOG_KEYS
    WHERE
      u.id != :PARKING_USER_ID AND
      ml.id IS NULL
  `, {
    PARKING_USER_ID,
    MAILLOG_TYPE,
    MAILLOG_KEYS
  })
    .then(users => users
      .map(user => transformUser(user))
    )
  console.log(`investigating ${users.length} users`)

  const stats = {
    numNeedProlong: 0,
    numNeedProlongProgress: 0,
    numOperations: 0
  }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const inNeedForProlongUsers = await Promise.filter(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        { ignoreClaimedMemberships: true },
        { pgdb, user: me }
      )
      stats.numNeedProlongProgress += 1
      if (prolongBeforeDate && moment(prolongBeforeDate).isBefore(PROLONG_BEFORE_DATE)) {
        stats.numNeedProlong += 1
        return true
      }
      return false
    },
    {concurrency: 10}
  )
  delete stats.numNeedProlongProgress

  const prolongUsers = uniqBy(
    inNeedForProlongUsers,
    u => u.id
  )
  stats.numProlongUsers = prolongUsers.length

  console.log('building operations...')
  const operations = await Promise.map(
    prolongUsers,
    async (user) => {
      const email = user.email.toLowerCase()
      const accessToken = await AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
      stats.numOperations += 1
      return {
        method: 'PUT',
        path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash(email)}`,
        body: JSON.stringify({
          // body <- don't touch, would change subscription status
          email_address: email,
          status_if_new: 'subscribed',
          'merge_fields': {
            [TOKEN_FIELD]: accessToken
          }
        })
      }
    },
    {concurrency: 10}
  )
  // console.log(operations)

  console.log(stats)
  clearInterval(statsInterval)

  if (!dry) {
    const batchesUrl = `${MAILCHIMP_URL}/3.0/batches`

    const result = await fetchAuthenticated('POST', batchesUrl, {
      body: JSON.stringify({
        operations
      })
    })
    console.log('mailchimp batch started:', result)

    let statusResult
    let lastStatus
    do {
      statusResult = await fetchAuthenticated('GET', `${batchesUrl}/${result.id}`)
      const newStatus = statusResult && statusResult.status
      if (lastStatus && lastStatus !== newStatus) {
        console.log('status changed: ', statusResult)
      }
      lastStatus = newStatus
      await sleep(1000)
    } while (!statusResult || statusResult.status !== 'finished')
  }

  console.log('finished!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
