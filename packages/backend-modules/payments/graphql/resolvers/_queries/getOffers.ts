import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  activeOffers,
  checkIntroductoryOfferEligibility,
  INTRODUCTERY_OFFER_PROMO_CODE,
  Shop,
} from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  const promoCode =
    (await checkIntroductoryOfferEligibility(ctx.pgdb, ctx.user)) &&
    typeof args.promoCode === 'undefined'
      ? INTRODUCTERY_OFFER_PROMO_CODE
      : args.promoCode

  return new Shop(activeOffers()).getOffers(promoCode)
}
