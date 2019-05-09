#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')

const dry = process.argv[2] === '--dry'

PgDb.connect().then(async pgdb => {
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  const fixMemberships = await pgdb.query(`
    SELECT
      to_jsonb(m1.*) AS mem1,
      to_jsonb(m2.*) AS mem2,
      to_jsonb(mp1.*) AS "mem1Periods",
      to_jsonb(mp2.*) AS "mem2Periods"
    FROM
      memberships m1
    JOIN
      memberships m2
      ON
        m1."userId" = m2."userId" AND
        m1.active = false AND
        m2.active = true
    JOIN
      "membershipPeriods" mp1
      ON
        m1.id = mp1."membershipId" AND
        mp1.kind != 'CHANGEOVER'
    JOIN
      "membershipPeriods" mp2
      ON
        m2.id = mp2."membershipId" AND
        mp2.kind = 'CHANGEOVER'
  `)

  console.log(JSON.stringify(fixMemberships, null, 2))
  console.log(fixMemberships.length)

  if (dry) {
    return
  }

  const transaction = await pgdb.transactionBegin()

  await Promise.each(
    fixMemberships,
    ({ mem1, mem2 }) => {
      return pgdb.public.memberships.updateOne(
        { id: mem1.id },
        { succeedingMembershipId: mem2.id }
      )
    }
  )
  await transaction.transactionCommit()

  await pgdb.close()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
