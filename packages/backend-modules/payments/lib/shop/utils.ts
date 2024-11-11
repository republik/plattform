import { PgDb } from 'pogi'

export async function hasHadMembership(userId: string, pgdb: PgDb) {
  const res = await pgdb.queryOne(
    `SELECT
        (
          (
            SELECT COUNT(*) FROM payments.subscriptions s
            WHERE s."userId" = :userId and s.status not in ('incomplete')
          )
          +
          (
            SELECT COUNT(*) FROM public.memberships m
            WHERE m."userId" = :userId
          )
        ) AS count`,
    { userId: userId },
  )

  return res?.count > 0
}
