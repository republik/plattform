#!/usr/bin/env node
/**
 * This script adds to mailchimp members:
 * - a CUSTOM_PLEDGE if they need to prolong before 2019-01-16
 * - the BONUS tag for who is eligable
 *
 *
 * Usage: (run from servers/republik)
 * node script/prolong/mcBonus.js
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
  isBonusEligable: getIsBonusEligable,
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
const BONUS_TAG_NAME = 'BONUS'

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

console.log('running updateMailchimp.js...')
PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  // load users with membership or pledge
  const users = await pgdb.query(`
    SELECT
      u.*
    FROM
      users u
    JOIN
      memberships m
      ON m."userId" = u.id
    WHERE
      u.id != :PARKING_USER_ID

    UNION

    SELECT
      u.*
    FROM
      users u
    JOIN
      pledges p
      ON p."userId" = u.id
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
    numBonusEligable: 0,
    numNeedProlong: 0,
    numBonusEligableProgress: 0,
    numNeedProlongProgress: 0,
    numOperations: 0
  }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const inNeedForProlongUsers = await Promise.filter(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(user, {}, { pgdb, user: me })
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

  const bonusEligableUsers = await Promise.filter(
    inNeedForProlongUsers,
    async (user) => {
      const eligable = await getIsBonusEligable(user, {}, { pgdb, user: me })
      stats.numBonusEligableProgress += 1
      if (eligable) {
        stats.numBonusEligable += 1
      }
      return eligable
    },
    {concurrency: 10}
  )
  delete stats.numBonusEligableProgress

  console.log('building operations...')
  let operations = await Promise.map(
    inNeedForProlongUsers,
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
            'CP_ATOKEN': accessToken
          }
          // of course tags can not be provided here 🤬
        })
      }
    },
    {concurrency: 10}
  )
  operations = operations.concat(
    bonusEligableUsers.map(user => {
      const email = user.email.toLowerCase()
      stats.numOperations += 1
      return {
        method: 'POST',
        path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash(email)}/tags`,
        body: JSON.stringify({
          tags: [
            {
              name: BONUS_TAG_NAME,
              status: 'active'
            }
          ]
        })
      }
    })
  )
  // console.log(operations)

  console.log(stats)
  clearInterval(statsInterval)

  if (!dry) {
    // create tag
    const resultTags = await fetchAuthenticated('POST', `${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}/segments`, {
      body: JSON.stringify({
        'name': BONUS_TAG_NAME,
        'static_segment': []
      })
    })
    console.log('mailchimp tag creation:', resultTags)

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
