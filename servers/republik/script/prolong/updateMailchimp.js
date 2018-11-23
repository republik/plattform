#!/usr/bin/env node
/**
 * This script adds a CUSTOM_PLEDGE access token to mailchimp
 * for users who are bonus eligable
 *
 * Usage: (run from servers/republik)
 * cat local/cancellations.csv | node script/prolong/updateMailchimp.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const Promise = require('bluebird')
const crypto = require('crypto')
const sleep = require('await-sleep')
const fetch = require('isomorphic-unfetch')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const { isBonusEligable } = require('../../modules/crowdfundings/graphql/resolvers/User')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID
} = process.env

if (!MAILCHIMP_MAIN_LIST_ID) {
  throw new Error('missing MAILCHIMP_API_KEY, check your setup')
}

const STATS_INTERVAL_SECS = 2

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

    UNION

    SELECT
      u.*
    FROM
      users u
    JOIN
      pledges p
      ON p."userId" = u.id
  `)
    .then(users => users
      .map(user => transformUser(user))
    )
  console.log(`investigating ${users.length} for isBonusEligable`)

  const stats = { numBonusEligable: 0, usersEvaluated: 0, operations: 0 }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const bonusEligableUsers = await Promise.filter(
    users,
    async (user) => {
      const eligable = await isBonusEligable(user, {}, { pgdb, user: me })
      if (eligable) {
        stats.numBonusEligable += 1
      }
      stats.usersEvaluated += 1
      return eligable
    },
    {concurrency: 10}
  )

  console.log('building operations...')
  const operations = await Promise.map(
    bonusEligableUsers,
    async (user) => {
      const email = user.email.toLowerCase()
      const accessToken = await AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
      stats.operations += 1
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
        })
      }
    },
    {concurrency: 10}
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
  }

  console.log('finish')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
