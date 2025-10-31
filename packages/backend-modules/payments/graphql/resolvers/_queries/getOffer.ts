import { GraphqlContext } from '@orbiting/backend-modules-types'
import { activeOffers } from '../../../lib/shop'
import { OfferBuilder } from '../../../lib/shop/OfferBuilder'
import { PaymentService } from '../../../lib/services/PaymentService'
import { OfferService } from '../../../lib/services/OfferService'

export = async function getOffer(
  _root: never,
  args: { offerId: string; promoCode?: string },
  ctx: GraphqlContext,
) {
  const offerService: OfferService = new OfferService(activeOffers())

  offerService.isValidOffer(args.offerId)
  const offer = offerService.getOffer(args.offerId)

  return new OfferBuilder(
    offerService,
    new PaymentService(),
    ctx.pgdb,
    offer,
    ctx.logger,
  )
    .withContext({ userId: ctx.user?.id })
    .withPromoCode(args.promoCode)
    .build()
}
