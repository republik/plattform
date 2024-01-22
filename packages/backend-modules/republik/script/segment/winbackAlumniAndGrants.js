#!/usr/bin/env node
/**
 * Finds alumni and access grant users without a membership and groups
 * these users into segments: is-almuni-monthly, is-alumni-abo and
 * had-access-granted.
 *
 * There are "@check" word marks to help adopt SQL stmt for other
 * purposes.
 *
 * SQL stmt links two tables extraordinnaire which require updating
 * (or rewiring) before this query returns meaningful results:
 * - paeMailchimpAbgleich
 * - paeMailchimpAudience
 *
 */

require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const debug = require('debug')(
  'republik:script:prolong:segmentUsersForMailchimp',
)

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const { AccessToken } = require('@orbiting/backend-modules-auth')
const {
  resolveMemberships,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/CustomPackages')
const {
  getPeriodEndingLast,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/utils')

const applicationName =
  'backends republik script prolong segmentUsersForMailchimp'

const stats = {}

const handleRow = async (row) => {
  const { memberships } = row

  // whether or not a user had any periods
  const hadSomePeriods =
    memberships
      .reduce((acc, cur) => acc.concat(cur.periods), [])
      .filter(Boolean).length > 0

  // find any currently active memberships
  const activeMembership = memberships.find((m) => m.active)

  // return last period of all memberships
  const lastPeriod = getPeriodEndingLast(
    memberships
      .reduce((acc, cur) => acc.concat(cur.periods), [])
      .filter(Boolean),
  )

  const packageName =
    lastPeriod?.pledge?.package?.name ||
    memberships.find((m) => m.id === lastPeriod.membershipId)?.pledge?.package
      ?.name

  const vars = {
    userId: row.id,
    hadSomePeriods,
    packageName,
  }

  const record = {
    id: row.id,
    EMAIL: row.email,
    FNAME: `"${row.firstName ?? ''}"`,
    LNAME: `"${row.lastName ?? ''}"`,
    PRLG_SEG: '',
    CP_ATOKEN: '',
    KAMPA_GRP: row.category,

    __vars: JSON.stringify(vars),
  }

  if (
    !activeMembership &&
    hadSomePeriods &&
    packageName &&
    packageName !== 'MONTHLY_ABO'
  ) {
    record.PRLG_SEG = 'is-alumni-abo'
    record.CP_ATOKEN = row.accessToken
  } else if (
    !activeMembership &&
    hadSomePeriods &&
    packageName &&
    packageName === 'MONTHLY_ABO'
  ) {
    record.PRLG_SEG = 'is-alumni-monthly'
    // ow.accessToken
  } else if (!activeMembership && !hadSomePeriods && row.category === 'GRANT') {
    record.PRLG_SEG = 'had-access-granted'
  } else {
    debug(record.__vars)
    throw new Error('aa')
  }

  const key = record.PRLG_SEG // [record.PRLG_SEG, row.category].filter(Boolean).join('/')

  if (!stats[key]) {
    stats[key] = 1
  } else {
    stats[key]++
  }

  // if (stats[key] <= 5) {
  console.log(
    Object.keys(record)
      .map((key) => record[key])
      .join(','),
  )
  // }
}

const handleBatch = async (rows, count, pgdb) => {
  const memberships = await resolveMemberships({
    memberships: await pgdb.public.memberships.find({
      userId: rows.map((row) => row.id),
    }),
    pgdb,
  })

  await Promise.map(rows, async (row, index) => {
    rows[index].memberships = memberships.filter((m) => m.userId === row.id)
    rows[index].accessToken = await AccessToken.generateForUser(
      row,
      'SUBMIT_PLEDGE',
    )
  })

  await Promise.map(rows, handleRow, { concurrency: 1 })
  debug('%i rows processed', count)
}

ConnectionContext.create(applicationName)
  .then(async (context) => {
    const { pgdb } = context

    console.log(
      [
        'id',
        'EMAIL',
        'FNAME',
        'LNAME',
        'PRLG_SEG',
        'CP_ATOKEN',
        'KAMPA_GRP',
        '__vars',
      ].join(','),
    )

    await pgdb
      .queryInBatches(
        { handleFn: handleBatch, size: 2000 },
        `
          WITH "latestMembershipCancellation" AS (
            SELECT
              DISTINCT ON (u.id)
              u.id "userId",
              mc.category,
              mc."membershipId",
              mc."createdAt"
          
            FROM "membershipCancellations" mc
            JOIN memberships m
              ON m.id = mc."membershipId"
            JOIN users u
              ON u.id = m."userId"
            
            ORDER BY u.id, "createdAt" DESC
          
          ), "latestPeriod" AS (
            SELECT
              DISTINCT ON (u.id)
              u.id "userId",
              m.id "membershipId",
              mp."beginDate",
              mp."endDate",
              mt.name "membershipTypeName",
              c.name "companyName"
          
            FROM "membershipPeriods" mp
            JOIN memberships m
              ON m.id = mp."membershipId"
            JOIN "membershipTypes" mt
              ON mt.id = m."membershipTypeId"
            JOIN companies c
              ON c.id = mt."companyId"
            JOIN users u
              ON u.id = m."userId"
            
            ORDER BY u.id, mp."endDate" DESC
              
          ), "latestAccessGrant" AS (
            SELECT
              DISTINCT ON (ag."recipientUserId")
              ag."accessCampaignId",
              ag."recipientUserId" "userId",
              ag."endAt"
          
            FROM "accessGrants" ag
            
            ORDER BY "recipientUserId", "invalidatedAt" DESC
          ), "winbackoids" AS (
            SELECT
              u.*,
              lmc.category,
              lp."membershipTypeName"
            
            FROM "latestMembershipCancellation" lmc
            
            JOIN "latestPeriod" lp
              ON lp."userId" = lmc."userId"
             AND lp."endDate" < '2022-11-01' -- @check: membership ended before November, 2022
            
            JOIN users u
              ON u.id = lmc."userId"
              
            -- Project-R-NL recipients
            LEFT JOIN "paeMailchimpAbgleich" pma
                  ON pma.email = u.email
            
            -- MC subscribers
            LEFT JOIN "paeMailchimpAudience" pmc
                  ON pmc.email = u.email
            
            WHERE lmc.category IN ('NO_TIME', 'RARELY_READ', 'TOO_MUCH_TO_READ', 'PAPER') -- @check: Cancellaction categories
              AND lmc."membershipId" = lp."membershipId"
              -- AND pma.email IS NULL -- @check: no Project-R-NL recieved
              AND pmc.email IS NOT NULL -- @check: still subscribed
          ), "trailers" AS (
            SELECT
              u.*,
              'GRANT' category,
              null "membershipTypeName"
            
            FROM "latestAccessGrant" lag
            
            JOIN users u
              ON u.id = lag."userId"
            
            LEFT JOIN "latestPeriod" lp
                  ON lp."userId" = u.id
                  
            -- Project-R-NL recipients
            LEFT JOIN "paeMailchimpAbgleich" pma
                  ON pma.email = u.email
            
            -- MC subscribers
            LEFT JOIN "paeMailchimpAudience" pmc
                  ON pmc.email = u.email
            
            WHERE lag."accessCampaignId" = 'b86c78c5-b36b-4de6-8656-44d5e1ba410b' -- @check: access campaign ID
              AND lp."userId" IS NULL
              -- AND pma.email IS NULL -- @check: no Project-R-NL recieved
              AND pmc.email IS NOT NULL -- @check: still subscribed
          )
          
          SELECT * FROM trailers
          
          UNION
          
          SELECT * FROM winbackoids
        `,
      )
      .catch((e) => console.error(e))

    debug(stats)
    debug('Done!')

    return context
  })
  .then((context) => ConnectionContext.close(context))
