async function getOtherActiveMagazineAccessMap({ memberships, pgdb }) {
  if (!memberships.length) return new Map()
  const rows = await pgdb.query(
    `SELECT
      m.id AS "membershipId",
      (
        (SELECT COUNT(*) FROM payments.subscriptions s
         WHERE s."userId" = m."userId"
         AND s.status NOT IN ('paused', 'canceled', 'incomplete'))
        +
        (SELECT COUNT(*) FROM public.memberships m2
         WHERE m2."userId" = m."userId"
         AND m2.active = true
         AND m2.id != m.id)
      ) AS count
    FROM public.memberships m
    WHERE m.id = ANY(:membershipIds)`,
    { membershipIds: memberships.map((m) => m.membershipId) },
  )
  return new Map(rows.map((r) => [r.membershipId, r.count > 0]))
}

module.exports = { getOtherActiveMagazineAccessMap }
