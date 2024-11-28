import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  checkIntroductoryOfferEligieblity,
  Offers,
  Shop,
} from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  const withEntryOffer = await checkIntroductoryOfferEligieblity(
    ctx.pgdb,
    ctx.user,
  )
  return new Shop(Offers).getOfferById(args.offerId, {
    promoCode: args.promoCode,
    withIntroductoryOffer: withEntryOffer,
  })
}
