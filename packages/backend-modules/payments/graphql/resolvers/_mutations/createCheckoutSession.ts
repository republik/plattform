import { GraphqlContext } from '@orbiting/backend-modules-types'
import { CheckoutSessionBuilder } from '../../../lib/shop/CheckoutSessionOptionBuilder'
import { PaymentService } from '../../../lib/services/PaymentService'
import { CustomerInfoService } from '../../../lib/services/CustomerInfoService'

type CreateCheckoutSessionArgs = {
  offerId: string
  promoCode?: string
  withDonation?: string
  withCustomDonation?: { amount: number }
  withSelectedDiscount?: string
  complimentaryItems: {
    id: string
    quantity: number
  }[]
  options?: {
    uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    promocode?: string
    customPrice?: number
    metadata?: Record<string, string>
    returnURL?: string
  }
}

export = async function createCheckoutSession(
  _root: never,
  args: CreateCheckoutSessionArgs,
  ctx: GraphqlContext,
) {
  const session = new CheckoutSessionBuilder(
    args.offerId,
    new PaymentService(),
    new CustomerInfoService(ctx.pgdb),
    ctx.logger,
  )
    .withCustomer(ctx.user)
    .withMetadata(args.options?.metadata)
    .withPromoCode(args.promoCode)
    .withSelectedDiscount(args.withSelectedDiscount)
    .withDonation(args.withCustomDonation)
    .withReturnURL(args.options?.returnURL)
    .withUIMode(args.options?.uiMode)

  return session.build()
}
