async function hasUserOtherActiveMagazineAccess({ userId, membershipId, pgdb }) {
  const res = await pgdb.queryOne(
    `SELECT (
      (SELECT COUNT(*) FROM payments.subscriptions s
       WHERE s."userId" = :userId AND s.status NOT IN ('paused', 'canceled', 'incomplete'))
      +
      (SELECT COUNT(*) FROM public.memberships m
       WHERE m."userId" = :userId AND m.active = true AND m.id != :membershipId)
    ) AS count`,
    { userId, membershipId },
  )
  return res?.count > 0
}

module.exports = { hasUserOtherActiveMagazineAccess }
