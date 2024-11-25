import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers, Shop, utils } from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  const withEntryOffer = ctx.user
    ? (await utils.hasHadMembership(ctx.user.id, ctx.pgdb)) === false
    : true // if there is no user we show the entry offers

  return new Shop(Offers).getOfferById(args.offerId, {
    promoCode: args.promoCode,
    withIntroductoryOffer: withEntryOffer,
  })
}
