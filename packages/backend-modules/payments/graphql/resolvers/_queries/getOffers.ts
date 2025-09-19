import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers, Shop } from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  return new Shop(activeOffers(), ctx.pgdb)
    .withContext({ userId: ctx.user?.id })
    .getOffers(args.promoCode)
}
