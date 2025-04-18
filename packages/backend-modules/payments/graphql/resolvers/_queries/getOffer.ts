import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers, Shop } from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: GraphqlContext,
) {
  return new Shop(activeOffers()).getOfferById(args.offerId, args.promoCode)
}
