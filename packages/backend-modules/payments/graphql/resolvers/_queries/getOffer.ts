import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  activeOffers,
  checkIntroductoryOfferEligibility,
  Shop,
} from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  return new Shop(activeOffers()).getOfferById(args.offerId, {
    promoCode: args.promoCode,
    withIntroductoryOffer: await checkIntroductoryOfferEligibility(
      ctx.pgdb,
      ctx.user,
    ),
  })
}
