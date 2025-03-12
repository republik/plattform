/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  Shop,
  checkIntroductoryOfferEligibility,
  activeOffers,
  isPromoCodeInBlocklist,
} from '../../../lib/shop'
import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { Company } from '../../../lib/types'

type CreateCheckoutSessionArgs = {
  offerId: string
  promoCode?: string
  withDonation?: string
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

  const offer = shop.isValidOffer(args.offerId)

  if (offer?.requiresLogin) Auth.ensureUser(ctx.user)

  const promoCode =
    args.promoCode && !isPromoCodeInBlocklist(args.promoCode)
      ? args.promoCode
      : undefined

  const customerId = await getCustomer(offer.company, ctx.user?.id)

  const sess = await shop.generateCheckoutSession({
    offer: offer,
    uiMode: args.options?.uiMode ?? 'EMBEDDED',
    customerId: customerId,
    customPrice: args.options?.customPrice,
    promoCode: promoCode,
    applyEntryOffer: await checkIntroductoryOfferEligibility(
      ctx.pgdb,
      ctx.user,
    ),
    selectedDonation: args.withDonation,
    metadata: args?.options?.metadata,
    returnURL: args?.options?.returnURL,
    complimentaryItems: args.complimentaryItems,
  })

  return {
    company: offer.company,
    sessionId: sess.id,
    clientSecret: sess.client_secret,
    url: sess.url,
  }
}

async function getCustomer(company: Company, userId?: string) {
  if (!userId) {
    return undefined
  }

  const customerId = (
    await Payments.getInstance().getCustomerIdForCompany(userId, company)
  )?.customerId

  if (customerId) {
    return customerId
  }

  return await Payments.getInstance().createCustomer(company, userId)
}
