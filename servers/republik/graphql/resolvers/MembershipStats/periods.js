const moment = require('moment')
const uniqBy = require('lodash/uniqBy')
const { ascending } = require('d3-array')
const debug = require('debug')('stats:periods')

const createCache = require('../../../modules/crowdfundings/lib/cache')
const QUERY_CACHE_TTL_SECONDS = 60 * 5 // 5 min

const { PARKING_USER_ID } = process.env

const DORMANT_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

// returns memberships with all its periods where one period ends in given range
const getMembershipsEndingInRange = (minEndDate, maxEndDate, membershipTypes, pgdb) => {
  const excludeParkingUserFragment =
    PARKING_USER_ID
      ? `m."userId" != '${PARKING_USER_ID}' AND`
      : ''

  return pgdb.query(`
    WITH dormant_membership_user_ids AS (
      SELECT
        DISTINCT(m."userId") as "userId"
      FROM
        memberships m
      JOIN
        pledges p
        ON m."pledgeId" = p.id
      JOIN
        packages pkg
        ON p."packageId" = pkg.id
      WHERE
        m.id NOT IN (SELECT "membershipId" FROM "membershipPeriods") AND --no period
        (
          -- claimed
          (m."userId" != p."userId") OR
          -- unclaimed GIVE is not "dormant"
          (m."userId" = p."userId" AND pkg.name != 'ABO_GIVE')
        ) AND
        ${excludeParkingUserFragment}
        m."membershipTypeId" IN (
          SELECT id FROM "membershipTypes" WHERE name = ANY('{${DORMANT_MEMBERSHIP_TYPES.join(',')}}')
        )
    ), m_ids_in_selection AS (
      SELECT
        DISTINCT(m.id) as id
      FROM
        memberships m
      JOIN
        "membershipPeriods" mp ON m.id = mp."membershipId"
      JOIN
        "membershipTypes" mt ON m."membershipTypeId" = mt.id
      WHERE
        ${excludeParkingUserFragment}
        m."userId" NOT IN (SELECT "userId" FROM dormant_membership_user_ids) AND
        mp."endDate" >= :minEndDate AND
        mp."endDate" <= :maxEndDate AND
        ARRAY[mt.name] && :membershipTypes
    )
      SELECT
        m.*,
        json_agg(mp.* ORDER BY mp."endDate" ASC) AS "membershipPeriods",
        json_agg(p.* ORDER BY p."createdAt" ASC) FILTER (WHERE p.id IS NOT NULL) AS "periodPledges",
        --- distinct not possible in this json_agg: in an aggregate with DISTINCT, ORDER BY expressions must appear in argument list
        json_agg(mc.* ORDER BY mc."createdAt" ASC) FILTER (WHERE mc.id IS NOT NULL) AS "membershipCancellations",
        json_agg(sm.*) FILTER (WHERE sm.id IS NOT NULL) AS "succeedingMemberships"
      FROM
        memberships m
      JOIN
        "membershipPeriods" mp ON m.id = mp."membershipId"
      LEFT JOIN
        "pledges" p ON mp."pledgeId" = p.id
      LEFT JOIN
        "membershipCancellations" mc
          ON
            m.id = mc."membershipId" AND
            mc.category != 'SYSTEM' AND
            mc."createdAt" <= :maxEndDate::timestamptz + m."graceInterval" AND
            (mc."revokedAt" IS NULL OR mc."revokedAt" > :maxEndDate::timestamptz + m."graceInterval")
      LEFT JOIN
        "memberships" sm ON m."succeedingMembershipId" = sm.id
      WHERE
        m.id IN (SELECT "id" FROM m_ids_in_selection)
      GROUP BY
        m.id
  `, {
    minEndDate,
    maxEndDate,
    membershipTypes
  })
}

const isPeriodEndingInRange = (period, minEndDate, maxEndDate) => {
  const endDate = moment(period.endDate)
  return (endDate.isSameOrAfter(minEndDate) && endDate.isSameOrBefore(maxEndDate))
}

// expects periods to be sorted by endDate ASC
const getLastMembershipPeriodIndexEndingInRange = (periods, minEndDate, maxEndDate) =>
  periods
    .reduce((acc, curr, index) =>
      isPeriodEndingInRange(curr, minEndDate, maxEndDate)
        ? index
        : acc,
    -1
    )

const createDays = (membershipTypes, includeCounterNames) => {
  const days = {}
  const counterNames = includeCounterNames
    ? includeCounterNames.reduce(
      (agg, cur) => {
        agg[cur] = 0
        return agg
      }, {})
    : {}
  return {
    increment: (date, counterName) => {
      // see packages/scalars/graphql/resolvers/Date.js
      const dayDate = moment(date)
        .startOf('day')
        .hour(12)
      const id = `${dayDate.toISOString()}_${membershipTypes.join('-')}`
      if (!days[id]) {
        days[id] = {
          id,
          date: dayDate
        }
      }
      const day = days[id]
      if (day[counterName]) {
        day[counterName]++
      } else {
        day[counterName] = 1
      }
      counterNames[counterName] = 0
    },
    toSortedArray: () => Object.keys(days)
      .map(dayDate => ({
        ...counterNames,
        ...days[dayDate]
      }))
      .sort((a, b) => ascending(a.date, b.date))
  }
}

module.exports = async (_, args, context) => {
  const {
    membershipTypes = ['ABO']
  } = args
  const minEndDate = moment(args.minEndDate).startOf('day')
  const maxEndDate = moment(args.maxEndDate).endOf('day')
  const queryId = `${minEndDate.toISOString(true)}-${maxEndDate.toISOString(true)}_${membershipTypes.join('-')}`

  return createCache({
    prefix: `MembershipStats`,
    key: queryId,
    ttl: QUERY_CACHE_TTL_SECONDS
  }, context)
    .cache(() => getPeriods({ minEndDate, maxEndDate, membershipTypes, queryId, context }))
}

const getPeriods = async ({ minEndDate, maxEndDate, membershipTypes, queryId, context }) => {
  const { pgdb } = context

  const allMemberships = await getMembershipsEndingInRange(minEndDate, maxEndDate, membershipTypes, pgdb)

  const membershipsInNeedForProlong = allMemberships
    .map(m => ({
      ...m,
      lastMembershipPeriodIndexEndingInRange: getLastMembershipPeriodIndexEndingInRange(m.membershipPeriods, minEndDate, maxEndDate)
    }))
    // if last period in range is followed by BONUS, it didn't need to be prolonged in range
    .filter(m => {
      const nextPeriod = m.membershipPeriods[m.lastMembershipPeriodIndexEndingInRange + 1]
      return !nextPeriod || nextPeriod.kind !== 'BONUS'
    })
    // sanitate with things impossible in SQL
    .map(m => ({
      ...m,
      membershipPeriods: m.membershipPeriods.map(mp => ({
        ...mp,
        pledge: mp.pledgeId
          ? m.periodPledges.find(p => p.id === mp.pledgeId)
          : null
      })),
      membershipCancellations: uniqBy(m.membershipCancellations, mc => mc.id)
    }))

  const days = createDays(membershipTypes, ['prolongCount', 'cancelCount'])

  const membershipsProlonged = membershipsInNeedForProlong
    .filter(m => {
      const lastPeriod = m.membershipPeriods[m.lastMembershipPeriodIndexEndingInRange]
      const prolongPeriod = m.membershipPeriods[m.lastMembershipPeriodIndexEndingInRange + 1]
      if (prolongPeriod &&
        !!moment(prolongPeriod.beginDate).isBetween(
          moment(lastPeriod.endDate).subtract(24, 'hours'),
          moment(lastPeriod.endDate).add(24, 'hours'),
          'hour',
          '[]'
        )
      ) {
        days.increment(
          prolongPeriod.pledge.createdAt,
          'prolongCount'
        )
        return true
      }

      if (m.succeedingMemberships && !!m.succeedingMemberships.length) {
        const succeedingMembership = m.succeedingMemberships[0]
        days.increment(
          succeedingMembership.createdAt,
          'prolongCount'
        )
        return true
      }
    })

  const membershipsCancelled = membershipsInNeedForProlong
    .filter(m =>
      // exclude memberships that were prolonged then cancelled
      membershipsProlonged.findIndex(mProlonged => mProlonged.id === m.id) === -1 &&
      m.membershipCancellations && m.membershipCancellations.length > 0
    )
    .map(m => {
      if (m.membershipCancellations.length > 1) {
        console.warn(
          'more than one non-revoked cancellation for membership',
          JSON.stringify(m, null, 2)
        )
      }
      days.increment(
        m.membershipCancellations[0].createdAt,
        'cancelCount'
      )
      return m
    })

  debug({
    minEndDate: minEndDate.toISOString(true),
    maxEndDate: maxEndDate.toISOString(true),
    total: membershipsInNeedForProlong.length,
    membershipsProlonged: membershipsProlonged.length,
    membershipsCancelled: membershipsCancelled.length
  })

  return {
    id: queryId,
    totalMemberships: membershipsInNeedForProlong.length,
    days: days.toSortedArray()
  }
}
