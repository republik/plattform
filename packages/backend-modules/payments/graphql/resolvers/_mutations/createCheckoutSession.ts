import { GraphqlContext } from '@orbiting/backend-modules-types'
import { CheckoutSessionBuilder } from '../../../lib/shop/CheckoutSessionOptionBuilder'
import { PaymentService } from '../../../lib/services/PaymentService'
import { CustomerInfoService } from '../../../lib/services/CustomerInfoService'
import { SubscriptionService } from '../../../lib/services/SubscriptionService'
import { UpgradeService } from '../../../lib/services/UpgradeService'
import { InvoiceService } from '../../../lib/services/InvoiceService'

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
    new SubscriptionService(ctx.pgdb),
    new UpgradeService(ctx.pgdb, ctx.logger),
    new InvoiceService(ctx.pgdb),
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
