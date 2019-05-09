#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const Promise = require('bluebird')
const { csvFormat } = require('d3-dsv')
const moment = require('moment')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  prolongBeforeDate: getProlongBeforeDate
} = require('../../modules/crowdfundings/graphql/resolvers/User')
const createCache = require('../../modules/crowdfundings/lib/cache')

const {
  PARKING_USER_ID
} = process.env

const PROLONG_BEFORE_DATE = moment('2019-01-16')

const me = {
  roles: ['admin']
}

const dry = process.argv[2] === '--dry'
const printIds = process.argv[2] === '--printIds'
const noBenefactors = process.argv[2] === '--no-benefactors' || process.argv[3] === '--no-benefactors'

const log = printIds
  ? () => {}
  : (...args) => console.log(...args)

log('Start')

const PROLONG_PACKAGE = '6b8897bf-7ab4-433c-92a1-64fafcd54417'
const PROLONG_PACAKGEOPTION_ABO = {
  id: 'c1cb2b16-8f03-4eec-851c-cea4204d7ff7',
  price: 24000
}
const PROLONG_PACAKGEOPTION_BENEFACTOR = {
  id: '35be2bea-4d3f-44e8-a224-2d17de6d6d51',
  price: 100000
}

const dueDate = moment().add(30, 'days')

const createPledgeAndPayments = async ({ transaction, option }, rows) =>
  Promise.map(rows, async row => {
    if (dry) {
      return { ...row, pledge: {}, pledgeOption: {}, payment: {}, pledgePayments: {} }
    }

    const pledge = await transaction.public.pledges.insertAndGet({
      packageId: PROLONG_PACKAGE,
      userId: row.user.id,
      status: 'WAITING_FOR_PAYMENT',
      total: option.price,
      donation: 0,
      sendConfirmMail: false
    })

    const pledgeOption = await transaction.public.pledgeOptions.insertAndGet({
      templateId: option.id,
      pledgeId: pledge.id,
      amount: 1,
      price: option.price,
      membershipId: row.membershipId
    })

    const payment = await transaction.public.payments.insertAndGet({
      type: 'PLEDGE',
      method: 'PAYMENTSLIP',
      paperInvoice: true,
      total: option.price,
      status: 'WAITING',
      dueDate
    })

    const pledgePayments = transaction.public.pledgePayments.insertAndGet({
      pledgeId: pledge.id,
      paymentId: payment.id,
      paymentType: 'PLEDGE'
    })

    const cache = createCache({ prefix: `User:${row.user.id}` }, { redis: Redis.connect() })
    await cache.invalidate()

    return { ...row, pledge, pledgeOption, payment, pledgePayments }
  })

const mapToCsv = d => ({
  id: d.user.id,
  user: d.user.name,
  name: d.address.name,
  line1: d.address.line1,
  line2: d.address.line2,
  postalCode: d.address.postalCode,
  city: d.address.city,
  country: d.address.country,
  membershipSequenceNumber: d.membershipSequenceNumber,
  hrid: d.payment.hrid,
  prolongBeforeDate: moment(d.prolongBeforeDate).format('DD.MM.YYYY'),
  admin: `https://admin.republik.ch/users/${d.user.id}`
})

PgDb.connect().then(async pgdb => {
  if (dry) {
    log("dry run: this won't change anything")
  }
  if (noBenefactors) {
    log('no-benefactors: skipping benefactors')
  }

  const enrichWithProlongAndAddress = async data => Promise.map(
    data,
    async (d) => {
      const user = transformUser(d)

      const cache = createCache({ prefix: `User:${user.id}` })
      await cache.invalidate()

      const prolongBeforeDate = await getProlongBeforeDate(
        user, {}, { pgdb, user: me }
      )
      if (
        prolongBeforeDate &&
        moment(prolongBeforeDate).isBefore(PROLONG_BEFORE_DATE)
      ) {
        const address = await pgdb.public.addresses.findOne({
          id: user._raw.addressId,
          country: ['Schweiz', 'schweiz', 'Liechtenstein']
        })
        if (!address) {
          return false
        }
        return {
          user,
          address,
          prolongBeforeDate,
          membershipId: d.membershipId,
          membershipSequenceNumber: d.membershipSequenceNumber
        }
      }
      return false
    },
    { concurrency: 10 }
  ).then(all => all.filter(Boolean))

  const benefactors = noBenefactors
    ? []
    : (await pgdb.query(`
      SELECT
        DISTINCT(u.*),
        m.id "membershipId",
        m."sequenceNumber" "membershipSequenceNumber",
        'benefactor' as type
      FROM
        users u
      JOIN memberships m
        ON m."userId" = u.id AND m.active AND m.renew
      JOIN "membershipTypes" mt
        ON mt.id = m."membershipTypeId"
      WHERE mt.name = 'BENEFACTOR_ABO' AND
         u.id != :PARKING_USER_ID
       ORDER BY
         u."lastName"
    `, { PARKING_USER_ID }))

  const paperPeople = (await pgdb.query(`
    SELECT
      DISTINCT(u.*),
      m.id "membershipId",
      m."sequenceNumber" "membershipSequenceNumber",
      'paperPerson' as type
    FROM users u
    JOIN memberships m ON m."userId" = u.id AND m.active AND m.renew
    JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
    JOIN pledges p ON m."pledgeId" = p.id AND p.total >= 24000
    JOIN "pledgePayments" pp ON pp."pledgeId" = p.id
    JOIN payments pay ON pp."paymentId" = pay.id AND pay."paperInvoice"
    WHERE
       u.id != :PARKING_USER_ID AND
       mt.name != 'BENEFACTOR_ABO'
     ORDER BY
       u."lastName"
  `, { PARKING_USER_ID }))
    .filter(u => !benefactors.find(b => b.id === u.id))

  log(`investigating ${paperPeople.length} paper people and ${benefactors.length} benefactors`)

  const transaction = await pgdb.transactionBegin()

  const benefactorNeedProlong = await enrichWithProlongAndAddress(benefactors)
    .then(createPledgeAndPayments.bind(
      this,
      { transaction, option: PROLONG_PACAKGEOPTION_BENEFACTOR }
    ))
  const paperPeopleNeedProlong = await enrichWithProlongAndAddress(paperPeople)
    .then(createPledgeAndPayments.bind(
      this,
      { transaction, option: PROLONG_PACAKGEOPTION_ABO }
    ))

  await transaction.transactionCommit()

  log(`need prolong before ${PROLONG_BEFORE_DATE.toISOString()}`)
  log('benefactors', benefactorNeedProlong.length)
  log('paper people', paperPeopleNeedProlong.length)

  if (printIds) {
    console.log([
      ...benefactorNeedProlong.map(d => d.user.id),
      ...paperPeopleNeedProlong.map(d => d.user.id)
    ].join('\n'))
  } else {
    log('benefactors')
    log('---')
    log(csvFormat(benefactorNeedProlong.filter(d => d.address).map(mapToCsv)))
    log('---')
    log('paper people')
    log('---')
    log(csvFormat(paperPeopleNeedProlong.filter(d => d.address).map(mapToCsv)))
    log('---')
  }

  await pgdb.close()

  log('finished!')
}).catch(e => {
  console.log(e)
  process.exit(1)
})
