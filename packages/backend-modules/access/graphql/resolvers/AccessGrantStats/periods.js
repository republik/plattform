module.exports = async (_, args, context) => {
  const { pgdb } = context

  const days = await pgdb.query(
    `
    SELECT
      range.date,
      COUNT(ag.id) as active,
      COUNT(ag.id) - COUNT(DISTINCT p.id) as "activeUnconverted",
      COUNT(DISTINCT p.id) as converted
    FROM (SELECT generate_series(:min::timestamp, :max, '1 day')::date as date) as range
    LEFT JOIN "accessGrants" ag ON ag."beginAt"::date <= range.date AND ag."endAt"::date >= range.date
    LEFT JOIN "pledges" p ON p."userId" = ag."recipientUserId" AND p."createdAt" BETWEEN ag."beginAt" AND ag."endAt" + '30 days'::interval
    GROUP BY 1
    ORDER BY 1
  `,
    {
      min: args.min,
      max: args.max,
    },
  )

  return {
    days,
    updatedAt: new Date(),
  }
}
