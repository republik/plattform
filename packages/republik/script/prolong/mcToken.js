#!/usr/bin/env node
/**
 * This script adds a CP_ATOKEN to mailchimp members to all that can prolong
 *
 * Usage:
 * cd servers/republik
 * script/prolong/mcToken.js --dry
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const crypto = require('crypto')
const sleep = require('await-sleep')
const fetch = require('isomorphic-unfetch')
const moment = require('moment')
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
const TOKEN_FIELD = 'CP_ATOKEN'

const me = {
  roles: ['admin']
}

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

const dry = process.argv[2] === '--dry'

console.log('preparing tokens...', { dry })

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

  const now = new Date()
  const prolongUsers = await Promise.filter(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        {},
        { pgdb, user: me }
      )
      stats.numProlongProgress += 1
      if (prolongBeforeDate && moment(prolongBeforeDate).diff(now, 'days') < 365) {
        stats.numProlong += 1
        return true
      }
      return false
    },
    { concurrency: 10 }
  )
  delete stats.numProlongProgress
  console.log(`${prolongUsers.length} users can prolong`)

  console.log('building operations...')
  stats.numOperations = 0
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
    { concurrency: 10 }
  )

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
    console.log('finished!')
  } else {
    console.log('dry exit')
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
