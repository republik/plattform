import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers } from '../../../lib/offers/offers'
import { PgDb } from 'pogi'
import { Store } from '../../../lib/offers/Store'

export = async function getOffer(
  _root: never,
  args: { offerId: string },
  ctx: GraphqlContext,
) {
  const withEntryOffer = ctx.user
    ? (await hasHadMembership(ctx.user.id, ctx.pgdb)) === false
    : true // if there is no user we show the entry offers

  const store = new Store(Offers)

  return store.getOfferById(args.offerId, {
    withDiscount: withEntryOffer,
  })
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
