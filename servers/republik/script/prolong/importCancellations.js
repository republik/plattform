#!/usr/bin/env node
/**
 * This script imports cancellations from a csv
 * columns: date, adminUrl, reason, category
 *
 * Usage:
 * cat local/cancellations.csv | node script/prolong/importCancellations.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const rw = require('rw')
const {dsvFormat} = require('d3-dsv')
const csvParse = dsvFormat(',').parse
const moment = require('moment')
const Promise = require('bluebird')

console.log('running importCancellations.js...')

const getNormalizedCategory = (category) => {
  switch (category) {
    case 'Inhaltliche Ausrichtung':
      return 'EDITORIAL'
    case 'Keine Zeit':
      return 'NO_TIME'
    case 'Zu teuer':
      return 'TOO_EXPENSIVE'
    case 'keine':
      return 'VOID'
    default:
      return 'OTHER'
  }
}

PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input || input.length < 4) {
    throw new Error('You need to provide input on stdin')
  }

  const stats = {
    numMemberships: 0
  }
  const numCancellationsBefore = await pgdb.public.membershipCancellations.count()

  const transaction = await pgdb.transactionBegin()
  await Promise.map(
    csvParse(input)
      .map(row => ({
        ...row,
        date: moment(row.date, 'DD.MM.YYYY'),
        userId: row.adminUrl.split('users/')[1]
      })),
    async ({ userId, date, reason, category }) => {
      const memberships = await transaction.public.memberships.find({
        userId,
        renew: true
      })

      const normalizedCategory = getNormalizedCategory(category)

      for (let membership of memberships) {
        await transaction.public.memberships.update(
          { id: membership.id },
          { renew: false }
        )
        await transaction.public.membershipCancellations.insert({
          membershipId: membership.id,
          reason: reason.length ? reason.trim() : null,
          category: normalizedCategory,
          suppressConfirmation: true,
          suppressWinback: true,
          createdAt: date
        })
      }
      stats.numMemberships += memberships.length
    },
    {concurrency: 10}
  )

  stats.numCancellationsCreated =
    await transaction.public.membershipCancellations.count() -
    numCancellationsBefore

  console.log(stats)

  if (dry) {
    await transaction.transactionRollback()
  } else {
    await transaction.transactionCommit()
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
