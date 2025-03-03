import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  activeOffers,
  checkIntroductoryOfferEligibility,
  INTRODUCTERY_OFFER_PROMO_CODE,
  Shop,
} from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  const promoCode =
    (await checkIntroductoryOfferEligibility(ctx.pgdb, ctx.user)) &&
    typeof args.promoCode === 'undefined'
      ? INTRODUCTERY_OFFER_PROMO_CODE
      : args.promoCode

  return new Shop(activeOffers()).getOfferById(args.offerId, promoCode)
}
