import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers, Shop, utils } from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  const entryOffer = ctx.user
    ? (await utils.hasHadMembership(ctx?.user.id, ctx.pgdb)) === false
    : true // if there is no user we show the entry offers

  const shop = new Shop(Offers)

  return shop.getOffers({
    promoCode: args.promoCode,
    withIntroductoryOffer: entryOffer,
  })
}
