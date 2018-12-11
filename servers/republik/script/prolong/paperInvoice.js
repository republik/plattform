#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const Promise = require('bluebird')
const { csvFormat } = require('d3-dsv')
const moment = require('moment')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../modules/crowdfundings/graphql/resolvers/User')

const {
  PARKING_USER_ID
} = process.env

const STATS_INTERVAL_SECS = 2
const PROLONG_BEFORE_DATE = moment('2019-01-16')

const me = {
  roles: ['admin']
}

console.log('Start')
PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  // load users with membership or pledge
  const users = await pgdb.query(`
    SELECT u.*
    FROM users u
    JOIN memberships m ON m."userId" = u.id AND m.active AND m.renew
    JOIN pledges p ON p."userId" = u.id
    JOIN "pledgePayments" pp ON pp."pledgeId" = p.id
    JOIN payments pay ON pp."paymentId" = pay.id AND pay."paperInvoice"
    WHERE
      u.id != :PARKING_USER_ID

    UNION

    SELECT
      u.*
    FROM
      users u
    JOIN memberships m
      ON m."userId" = u.id AND m.active AND m.renew
    JOIN "membershipTypes" mt
      ON mt.id = m."membershipTypeId"
    WHERE mt.name = 'BENEFACTOR_ABO' AND
      u.id != :PARKING_USER_ID
  `, {
    PARKING_USER_ID
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

  const inNeedForProlongUsers = (await Promise.map(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(user, {}, { pgdb, user: me })
      stats.numNeedProlongProgress += 1
      if (prolongBeforeDate && moment(prolongBeforeDate).isBefore(PROLONG_BEFORE_DATE)) {
        stats.numNeedProlong += 1
        const address = await pgdb.public.addresses.findOne({
          id: user._raw.addressId
        })
        return {
          user,
          address,
          prolongBeforeDate
        }
      }
      return false
    },
    {concurrency: 10}
  )).filter(Boolean).filter(d => d.address)
  delete stats.numNeedProlongProgress

  console.log(stats)
  clearInterval(statsInterval)

  console.log('users', inNeedForProlongUsers.length)
  if (!dry) {
    console.log('---')
    console.log(csvFormat(inNeedForProlongUsers.map(d => ({
      id: d.user.id,
      user: d.user.name,
      name: d.address.name,
      line1: d.address.line1,
      line2: d.address.line2,
      postalCode: d.address.postalCode,
      city: d.address.city,
      country: d.address.country,
      prolongBeforeDate: d.prolongBeforeDate,
      admin: `https://admin.republik.ch/users/${d.user.id}`
    }))))
    console.log('---')
  }
  console.log('finished!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
