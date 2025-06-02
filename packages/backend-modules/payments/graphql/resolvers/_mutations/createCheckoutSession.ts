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
  const session = await new CheckoutSessionBuilder(
    args.offerId,
    new PaymentService(),
    new CustomerInfoService(ctx.pgdb),
  ).withCustomer(ctx.user)

  session
    .withMetadata(args.options?.metadata)
    .withPromoCode(args.promoCode)
    .withDonation(args.withCustomDonation)
    .withReturnURL(args.options?.returnURL)
    .withUIMode(args.options?.uiMode)

  if (args.withSelectedDiscount) {
    await session.withSelectedDiscount(args.withSelectedDiscount)
  }

  return session.build()
}
