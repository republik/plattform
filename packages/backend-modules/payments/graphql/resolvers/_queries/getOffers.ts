import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers, Shop } from '../../../lib/shop'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  _ctx: GraphqlContext,
) {
  return new Shop(activeOffers()).getOffers(args.promoCode)
}
