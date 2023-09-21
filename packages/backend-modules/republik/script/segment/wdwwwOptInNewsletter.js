#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const debug = require('debug')(
  'republik:script:prolong:segmentUsersForMailchimp',
)

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const {
  getConsentLink,
} = require('@orbiting/backend-modules-republik/lib/Newsletter')

const applicationName =
  'backends republik script prolong segmentUsersForMailchimp'

const handleRow = async (row) => {
  const record = {
    id: row.id,
    EMAIL: row.email,
    FNAME: `"${row.firstName ?? ''}"`,
    LNAME: `"${row.lastName ?? ''}"`,
    NL_LINK_WDWWW: getConsentLink(row.email, 'WDWWW'),
  }
  console.log(
    Object.keys(record)
      .map((key) => record[key])
      .join(','),
  )
}

const handleBatch = async (rows, count, pgdb) => {
  await Promise.map(rows, handleRow, { concurrency: 1 })
  debug('%i rows processed', count)
}

ConnectionContext.create(applicationName)
  .then(async (context) => {
    const { pgdb } = context

    console.log(['id', 'EMAIL', 'FNAME', 'LNAME', 'NL_LINK_WDWWW'].join(','))

    await pgdb
      .queryInBatches(
        { handleFn: handleBatch, size: 2000 },
        `
          SELECT u.*, pmc."Customer"
         FROM users u
          -- Include if only users with memberships matter
          -- LEFT JOIN memberships m ON m."userId" = u.id

          -- Test Geschenk-Monatsabos:
          -- JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId" AND mt.name IN ('ABO_GIVE_MONTHS') AND m.active = TRUE

          -- Test Monatsabos:
          -- JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId" AND mt.name IN ('MONTHLY_ABO') AND m.active = TRUE

          -- Link to temp MailChimp Audience table
        JOIN "paeMailchimpAudience" pmc ON pmc.email = u.email

          WHERE
            u.email != 'jefferson@project-r.construction'
            AND "deletedAt" IS NULL
            AND u.email NOT LIKE '%_deleted@republik.ch'
            AND pmc."Customer" NOT like '%Member%'
            -- Benachrichten notwendig
            -- AND u.roles @> '"gen202211"'
            -- AND m.active = TRUE
            -- Test specific user:
            -- AND u.id = 'd94a7540-afbd-4134-b35d-19f9f5a28598'
            -- ND pmc."Republik NL" LIKE '%Project R%'
            -- AND u.id = 
            /* AND u.id IN (
              '8320ccba-529b-4682-907d-1d8c1fe5aca3',
              '3b0dad5c-813a-4003-b4e1-64e3dfd137d7',
              '7f7f5474-8d85-4ab4-86a0-ad48c300019e'
            ) */
          -- GROUP BY u.id
          ORDER BY RANDOM()
          -- LIMIT 100
          ;
        `,
      )
      .catch((e) => console.error(e))

    debug('Done!')

    return context
  })
  .then((context) => ConnectionContext.close(context))
