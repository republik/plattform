/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers } from '../../../lib/offers/offers'
import { Shop } from '../../../lib/offers/Shop'
import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { PgDb } from 'pogi'

type CreateCheckoutSessionArgs = {
  offerId: string
  options?: {
    uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    promocode?: string
    customPrice: number
  }
}

export = async function createCheckoutSession(
  _root: never,
  args: CreateCheckoutSessionArgs,
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const shop = new Shop(Offers)
  const entryOffer = (await hasHadMembership(ctx.user.id, ctx.pgdb)) === false

  const offer = await shop.getOfferById(args.offerId, {
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
  })

  return {
    company: offer.company,
    sessionId: sess.id,
    clientSecret: sess.client_secret || '',
    url: sess.url,
  }
}

async function hasHadMembership(userId: string, pgdb: PgDb) {
  const res = await pgdb.queryOne(
    `SELECT
        (
          (
            SELECT COUNT(*) FROM payments.subscriptions s
            WHERE s."userId" = :userId and s.status not in ('incomplete')
          )
          +
          (
            SELECT COUNT(*) FROM public.memberships m
            WHERE m."userId" = :userId
          )
        ) AS count`,
    { userId: userId },
  )

  return res?.count > 0
}
