module.exports = async (user, pgdb) => {
  const res = await pgdb.queryOne(
    `SELECT
        (
          (
            SELECT COUNT(*) FROM payments.subscriptions s
            WHERE s."userId" = :userId and s.status not in ('paused', 'canceled', 'incomplete', 'incomplete_expired')
          )
          +
          (
            SELECT COUNT(*) FROM public.memberships m
            WHERE m."userId" = :userId and m.active = true
          )
        ) AS count`,
    { userId: user.id },
  )

  return res?.count > 0
}
