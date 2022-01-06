#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const moment = require('moment')
const debug = require('debug')(
  'republik:script:prolong:segmentUsersForMailchimp',
)

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const { AccessToken } = require('@orbiting/backend-modules-auth')
const {
  findEligableMemberships,
  hasDormantMembership: hasDormantMembership_,
  resolveMemberships,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/CustomPackages')
const {
  getPeriodEndingLast,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/utils')

const applicationName =
  'backends republik script prolong segmentUsersForMailchimp'

const stats = {}

const handleRow = async (row) => {
  const { memberships, ...user } = row

  // whether or not a user had any periods
  const hadSomePeriods =
    memberships
      .reduce((acc, cur) => acc.concat(cur.periods), [])
      .filter(Boolean).length > 0

  // find any currently active memberships
  const activeMembership = memberships.find((m) => m.active)

  // memberships which could be prolonged
  const eligableMemberships = findEligableMemberships({
    memberships,
    user,
    ignoreClaimedMemberships: true,
  })

  // check if there is a dormant membership
  const hasDormantMembership = hasDormantMembership_({
    user,
    memberships: eligableMemberships,
  })

  // return last period of all memberships
  const lastPeriod = getPeriodEndingLast(
    memberships
      .reduce((acc, cur) => acc.concat(cur.periods), [])
      .filter(Boolean),
  )

  // return last end date of all memberships
  const lastEndDate = !!lastPeriod && moment(lastPeriod.endDate)

  // if active, package option used to pay latest period
  const mostRecentPackageOption =
    activeMembership?.latestPeriod?.pledgeOption?.packageOption

  // if active, package option used to buy membership
  const pledgePackageOption = activeMembership?.pledgeOption?.packageOption

  // if active, current membership type name
  const membershipTypeName =
    mostRecentPackageOption?.membershipType?.name ||
    pledgePackageOption?.membershipType?.name

  const record = {
    id: row.id,
    EMAIL: row.email,
    FNAME: `"${row.firstName}"` || '',
    LANEM: `"${row.lastName}"` || '',
    PRLG_SEG: '',
    CP_ATOKEN: '',
  }

  if (
    activeMembership &&
    !hasDormantMembership &&
    membershipTypeName !== 'MONTHLY_ABO' &&
    lastEndDate?.isBefore('2022-05-01')
  ) {
    record.PRLG_SEG = 'prolong-before-may'
    record.CP_ATOKEN = row.accessToken
  } else if (
    !activeMembership
  ) {
    // inactive
    record.PRLG_SEG = ''
  } else {
    // active + lastEndDate > 2022-05-01
    // active + dormant
    // active + MONTHLY
    record.PRLG_SEG = 'no-action-required'
  }

  if (!stats[record.PRLG_SEG]) {
    stats[record.PRLG_SEG] = 1
  } else {
    stats[record.PRLG_SEG]++
  }

  // if (stats[record.PRLG_SEG] <= 10) {
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
      'CUSTOM_PLEDGE_EXTENDED',
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
      ].join(','),
    )

    await pgdb
      .queryInBatches(
        { handleFn: handleBatch, size: 2000 },
        `
          SELECT u.*
          FROM users u
          -- Include if only users with memberships matter
          JOIN memberships m ON m."userId" = u.id
          
          -- Test Geschenk-Monatsabos:
          -- JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId" AND mt.name IN ('ABO_GIVE_MONTHS') AND m.active = TRUE
          -- Test Monatsabos:
          -- JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId" AND mt.name IN ('MONTHLY_ABO') AND m.active = TRUE
          WHERE
            email != 'jefferson@project-r.construction'
            AND "deletedAt" IS NULL
            AND email NOT LIKE '%_deleted@republik.ch'
            -- Benachrichten notwendig
            -- AND roles @> '"gen202111"' AND m.active = TRUE
            -- Test specific user:
            -- AND u.id = 'd94a7540-afbd-4134-b35d-19f9f5a28598'
          GROUP BY u.id
          ORDER BY RANDOM()
          -- LIMIT 100
        `,
      )
      .catch((e) => console.error(e))

    debug('Done!')

    return context
  })
  .then((context) => ConnectionContext.close(context))