const moment = require('moment')
const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')

const { PARKING_USER_ID } = process.env

module.exports = (_, args, { pgdb, user: me }) => ({
  count: async () => {
    return pgdb.queryOneField(`
      SELECT
        count(*)
      FROM
        memberships m
      JOIN
        "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      WHERE
        m."userId" != :excludeUserId AND
        (
          mt.name != 'MONTHLY_ABO' OR (
            mt.name = 'MONTHLY_ABO' and m.active = true
          )
        )
    `, {
      excludeUserId: PARKING_USER_ID
    })
  },
  monthlys: async () => {
    ensureUserIsInRoles(me, ['editor', 'admin', 'supporter'])
    // this generates a sorted day-series from
    // min(beginDate) to max(beginDate)
    const dayFormat = 'YYYY-MM-DD'
    const daySeries = await pgdb.query(`
      WITH monthly_periods_boundaries AS (
        SELECT
          min("beginDate") as min,
          max("beginDate") as max
        FROM
          memberships m
        JOIN
          "membershipTypes" mt
          ON m."membershipTypeId" = mt.id
        JOIN
          "membershipPeriods" mp
          ON mp."membershipId" = m.id
        WHERE
          mt.name = 'MONTHLY_ABO'
      )
      SELECT
        date_trunc('day', dd)::date as day
      FROM
        generate_series(
          (SELECT min FROM monthly_periods_boundaries),
          (SELECT max FROM monthly_periods_boundaries),
          '1 day'::interval
        ) dd;
    `)
      .then(result => result.map(r => moment(r.day).format(dayFormat)))
    const memberships = await pgdb.query(`
      SELECT
        m.*,
        json_agg(mp.* ORDER BY mp."beginDate") as "periods"
      FROM
        memberships m
      JOIN
        "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      JOIN
        "membershipPeriods" mp
        ON mp."membershipId" = m.id
      WHERE
        mt.name = 'MONTHLY_ABO'
      GROUP BY
        m.id
    `)
      .then(
        memberships => memberships.map(m => ({
          ...m,
          periods: m.periods.map(mp => ({
            ...mp,
            beginDate: moment(mp.beginDate).format(dayFormat),
            endDate: moment(mp.endDate).format(dayFormat)
          }))
        }))
      )
    const days = {}
    const defaultDay = {
      newCount: 0,
      renewableCount: 0,
      renewedCount: 0,
      renewedRatio: 0
    }
    for (let membership of memberships) {
      for (let mpIndex = 0; mpIndex < membership.periods.length; mpIndex++) {
        const mp = membership.periods[mpIndex]
        if (!days[mp.endDate]) {
          days[mp.endDate] = { ...defaultDay }
        }
        if (!days[mp.beginDate]) {
          days[mp.beginDate] = { ...defaultDay }
        }
        days[mp.endDate].renewableCount += 1
        if (
          mpIndex > 0 &&
          moment(membership.periods[mpIndex - 1].endDate).isSame(mp.beginDate, 'day')
        ) {
          days[mp.beginDate].renewedCount += 1
        } else {
          days[mp.beginDate].newCount += 1
        }
      }
    }
    return daySeries.map(dayDate => {
      const day = days[dayDate]
      if (day) {
        return {
          ...day,
          day: dayDate,
          renewedRatio: day.renewableCount > 0
            ? 100 / day.renewableCount * day.renewedCount
            : 0
        }
      }
      return {
        ...defaultDay,
        day: dayDate
      }
    })
  }
})
