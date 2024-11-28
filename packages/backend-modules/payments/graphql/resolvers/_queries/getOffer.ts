import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  checkIntroductoryOfferEligeblity,
  Offers,
  Shop,
} from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  const withEntryOffer = await checkIntroductoryOfferEligeblity(
    ctx.pgdb,
    ctx.user,
  )
  return new Shop(Offers).getOfferById(args.offerId, {
    promoCode: args.promoCode,
    withIntroductoryOffer: withEntryOffer,
  })
}
