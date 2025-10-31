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
  const offerService = new OfferService(activeOffers())
  const allOffers = offerService.getOffers()
  const paymentService = new PaymentService()

  const fetcher = (offers: Offer[]) =>
    new OfferBuilder(offerService, paymentService, ctx.pgdb, offers, ctx.logger)
      .withContext({ userId: ctx.user?.id })
      .withPromoCode(args.promoCode)
      .buildAll()

  return (
    await Promise.all([
      fetcher(allOffers.filter((o) => o.company === 'REPUBLIK')),
      fetcher(allOffers.filter((o) => o.company === 'PROJECT_R')),
    ])
  ).flat()
}
