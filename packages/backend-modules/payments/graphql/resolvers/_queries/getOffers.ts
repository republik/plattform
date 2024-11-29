import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  checkIntroductoryOfferEligibility,
  Offers,
  Shop,
} from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  return new Shop(Offers).getOffers({
    promoCode: args.promoCode,
    withIntroductoryOffer: await checkIntroductoryOfferEligibility(
      ctx.pgdb,
      ctx.user,
    ),
  })
}
