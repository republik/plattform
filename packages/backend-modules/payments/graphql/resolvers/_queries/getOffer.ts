import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers, Shop } from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  return new Shop(activeOffers(), ctx.pgdb)
    .withContext({ userId: ctx.user.id })
    .getOfferById(args.offerId, args.promoCode)
}
