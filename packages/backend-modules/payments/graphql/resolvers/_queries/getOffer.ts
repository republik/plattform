import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers, Shop, utils } from '../../../lib/shop'

export = async function getOffer(
  _root: never,
  args: { offerId: string },
  ctx: GraphqlContext,
) {
  const withEntryOffer = ctx.user
    ? (await utils.hasHadMembership(ctx.user.id, ctx.pgdb)) === false
    : true // if there is no user we show the entry offers

  const shop = new Shop(Offers)

  return shop.getOfferById(args.offerId, {
    withIntroductoryOffer: withEntryOffer,
  })
}
