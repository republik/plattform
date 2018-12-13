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

const PROLONG_BEFORE_DATE = moment('2019-01-16')

const me = {
  roles: ['admin']
}

const dry = process.argv[2] === '--dry'
const printIds = process.argv[2] === '--printIds'

const log = printIds
  ? () => {}
  : message => console.log(message)

log('Start')

PgDb.connect().then(async pgdb => {
  if (dry) {
    log("dry run: this won't change anything")
  }

  const dedupAndTransform = users => users
    .filter((u, i, a) => i === a.findIndex(d => d.id === u.id))
    .map(u => transformUser(u))

  const enrichWithProlongAndAddress = async users => Promise.map(
    users,
    async (user) => {
      const prolongBeforeDate = await getProlongBeforeDate(user, {}, { pgdb, user: me })
      if (prolongBeforeDate && moment(prolongBeforeDate).isBefore(PROLONG_BEFORE_DATE)) {
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
  ).then(all => all.filter(Boolean))

  const benefactors = dedupAndTransform(await pgdb.query(`
    SELECT
      u.*, 'benefactor' as type
    FROM
      users u
    JOIN memberships m
      ON m."userId" = u.id AND m.active AND m.renew
    JOIN "membershipTypes" mt
      ON mt.id = m."membershipTypeId"
    WHERE mt.name = 'BENEFACTOR_ABO' AND
      u.id != :PARKING_USER_ID
  `, { PARKING_USER_ID }))

  const paperPeople = dedupAndTransform(await pgdb.query(`
    SELECT u.*, 'paperPerson' as type
    FROM users u
    JOIN memberships m ON m."userId" = u.id AND m.active AND m.renew
    JOIN pledges p ON p."userId" = u.id
    JOIN "pledgePayments" pp ON pp."pledgeId" = p.id
    JOIN payments pay ON pp."paymentId" = pay.id AND pay."paperInvoice"
    WHERE
      u.id != :PARKING_USER_ID
  `, { PARKING_USER_ID })).filter(u => !benefactors.find(b => b.id === u.id))

  log(`investigating ${paperPeople.length} paper people and ${benefactors.length} benefactors`)

  const benefactorNeedProlong = await enrichWithProlongAndAddress(benefactors)
  const paperPeopleNeedProlong = await enrichWithProlongAndAddress(paperPeople)

  log(`need prolong before ${PROLONG_BEFORE_DATE.toISOString()}`)
  log('benefactors', benefactorNeedProlong.length)
  log('paper people', paperPeopleNeedProlong.length)

  log('without address')
  log('benefactors', benefactorNeedProlong.filter(d => !d.address).length)
  log('paper people', paperPeopleNeedProlong.filter(d => !d.address).length)

  const mapToCsv = d => ({
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
  })

  if (printIds) {
    console.log([
      ...benefactorNeedProlong.map(d => d.user.id),
      ...paperPeopleNeedProlong.map(d => d.user.id)
    ].join('\n'))
  } else if (!dry) {
    log('benefactors')
    log('---')
    log(csvFormat(benefactorNeedProlong.filter(d => d.address).map(mapToCsv)))
    log('---')
    log('paper people')
    log('---')
    log(csvFormat(paperPeopleNeedProlong.filter(d => d.address).map(mapToCsv)))
    log('---')
  }
  log('finished!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
