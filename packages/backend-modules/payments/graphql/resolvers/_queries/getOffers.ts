import { GraphqlContext } from '@orbiting/backend-modules-types'
import { fetchOffers } from '../../../lib/offers/offers'
import { PgDb } from 'pogi'

export = async function getOffers(
  _root: never,
  _args: any,
  ctx: GraphqlContext,
) {
  const isEligibleForEntryOffer = ctx.user
    ? (await hasHadMembership(ctx?.user.id, ctx.pgdb)) === false
    : true // if there is no user we show the entry offers

  const offers = (
    await Promise.all([
      await fetchOffers({
        company: 'PROJECT_R',
        promoCode: isEligibleForEntryOffer ? 'EINSTIEG' : undefined,
      }),
      await fetchOffers({
        company: 'REPUBLIK',
        promoCode: isEligibleForEntryOffer ? 'EINSTIEG' : undefined,
      }),
    ])
  ).flat()

  return offers
}

async function hasHadMembership(userId: string, pgdb: PgDb) {
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
