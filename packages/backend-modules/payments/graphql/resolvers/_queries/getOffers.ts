import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers } from '../../../lib/shop'
import { Offer } from '../../../lib/types'
import { OfferBuilder } from '../../../lib/shop/OfferBuilder'
import { OfferService } from '../../../lib/services/OfferService'
import { PaymentService } from '../../../lib/services/PaymentService'

export = async function getOffers(
  _root: never,
  args: { promoCode?: string },
  ctx: GraphqlContext,
) {
  const offers = new OfferService(activeOffers()).getOffers()

  const fetcher = (offers: Offer[]) =>
    new OfferBuilder(new PaymentService(), ctx.pgdb, offers, ctx.logger)
      .withContext({ userId: ctx.user?.id })
      .withPromoCode(args.promoCode)
      .buildAll()

  return (
    await Promise.all([
      fetcher(offers.filter((o) => o.company === 'REPUBLIK')),
      fetcher(offers.filter((o) => o.company === 'PROJECT_R')),
    ])
  ).flat()
}
