/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Shop, Offers, utils } from '../../../lib/shop'
import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { requiredCustomFields } from '../../../lib/shop/utils'

type CreateCheckoutSessionArgs = {
  offerId: string
  promoCode?: string
  options?: {
    uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    promocode?: string
    customPrice?: number
    metadata?: Record<string, string>
  }
}

export = async function createCheckoutSession(
  _root: never,
  args: CreateCheckoutSessionArgs,
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const shop = new Shop(Offers)
  const entryOffer =
    (await utils.hasHadMembership(ctx.user.id, ctx.pgdb)) === false

  const offer = await shop.getOfferById(args.offerId, {
    promoCode: args.promoCode,
    withIntroductoryOffer: entryOffer,
  })

  if (!offer) {
    throw new Error('Unknown offer')
  }

  let customerId = (
    await Payments.getInstance().getCustomerIdForCompany(
      ctx.user.id,
      offer.company,
    )
  )?.customerId

  if (!customerId) {
    customerId = await Payments.getInstance().createCustomer(
      offer.company,
      ctx.user.id,
    )
  }

  const sess = await shop.generateCheckoutSession({
    offer: offer,
    uiMode: args.options?.uiMode ?? 'EMBEDDED',
    customerId: customerId,
    customPrice: args.options?.customPrice,
    discounts: offer.discount?.couponId
      ? [offer.discount?.couponId]
      : undefined,
    customFields: requiredCustomFields(ctx.user),
    metadata: args?.options?.metadata,
  })

  return {
    company: offer.company,
    sessionId: sess.id,
    clientSecret: sess.client_secret,
    url: sess.url,
  }
}
