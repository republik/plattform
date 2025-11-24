const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = ({ pgdb }) => ({
  byMembershipId: createDataLoader(async (ids) => {
    const periods = await pgdb.public.membershipPeriods.find({
      membershipId: ids,
    })

    const periodsByMemberId = new Map()

    periods.forEach((period) => {
      const id = period.membershipId
      if (!periodsByMemberId.has(id)) {
        periodsByMemberId.set(id, [])
      }
      periodsByMemberId.get(id).push(period)
    })

    return ids.map((id) => {
      return { id, periods: periodsByMemberId.get(id) || [] }
    })
  }),
  latestByMembershipId: createDataLoader(async (ids) => {
    const periods = await pgdb.public.query(
      `
    WITH latest_periods AS (
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY "membershipId"
                ORDER BY "createdAt" DESC
            ) as _row_number
        FROM "membershipPeriods"
        WHERE "membershipId" = ANY (:ids)
    )
    SELECT * FROM latest_periods WHERE _row_number = 1;
    `,
      { ids: ids },
    )

    const periodsByMemberId = new Map()

    periods.forEach((period) => {
      const id = period.membershipId
      if (!periodsByMemberId.has(id)) {
        periodsByMemberId.set(id, [])
      }
      periodsByMemberId.get(id).push(period)
    })

    return ids.map((id) => {
      return { id, latestPeriod: periodsByMemberId.get(id) }
    })
  }),
  byMembershipIdInDescOrder: createDataLoader(async (ids) => {
    const periods = await pgdb.public.membershipPeriods.find(
      {
        membershipId: ids,
      },
      { orderBy: { endDate: 'DESC' } },
    )
    const periodsByMemberId = new Map()

    periods.forEach((period) => {
      const id = period.membershipId
      if (!periodsByMemberId.has(id)) {
        periodsByMemberId.set(id, [])
      }
      periodsByMemberId.get(id).push(period)
    })

    return ids.map((id) => {
      return { id, periods: periodsByMemberId.get(id) || [] }
    })
  }, null),
})
