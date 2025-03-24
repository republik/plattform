/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  Shop,
  checkIntroductoryOfferEligibility,
  activeOffers,
} from '../../../lib/shop'
import { CheckoutSessionOptionBuilder } from '../../../lib/shop/CheckoutSessionOptionBuilder'

type CreateCheckoutSessionArgs = {
  offerId: string
  promoCode?: string
  withDonation?: string
  withCustomDonation?: { amount: number }
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
  const shop = new Shop(activeOffers())

  const sessionOptions = await new CheckoutSessionOptionBuilder(
    args.offerId,
    args.options?.uiMode,
  ).withCustomer(ctx.user)

  sessionOptions
    .withMetadata(args.options?.metadata)
    .withEntryOffer(await checkIntroductoryOfferEligibility(ctx.pgdb, ctx.user))
    .withPromoCode(args.promoCode)
    .withDonation(args.withDonation || args.withCustomDonation)
    .withReturnURL(args.options?.returnURL)

  return await shop.generateCheckoutSession(sessionOptions.build())
}
