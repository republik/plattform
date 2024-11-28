import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  checkIntroductoryOfferEligieblity,
  Offers,
  Shop,
} from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  const entryOffer = await checkIntroductoryOfferEligieblity(ctx.pgdb, ctx.user)

  return new Shop(Offers).getOffers({
    promoCode: args.promoCode,
    withIntroductoryOffer: entryOffer,
  })
}
