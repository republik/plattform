import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  checkIntroductoryOfferEligeblity,
  Offers,
  Shop,
} from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  const entryOffer = await checkIntroductoryOfferEligeblity(ctx.pgdb, ctx.user)

  return new Shop(Offers).getOffers({
    promoCode: args.promoCode,
    withIntroductoryOffer: entryOffer,
  })
}
