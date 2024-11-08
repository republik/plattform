/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Offers } from '../../../lib/offers/offers'
import { Shop } from '../../../lib/offers/Shop'
import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'

type CreateCheckoutSessionArgs = {
  offerId: string
  promocode?: string
  options?: {
    customPrice: number
  }
}

export = async function createCheckoutSession(
  _root: never,
  args: CreateCheckoutSessionArgs,
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  console.log(args)

  const entryOffer = (await hasHadMembership(ctx.user.id, ctx.pgdb)) === false

  const shop = new Shop(Offers)

  const offer = await shop.getOfferById(args.offerId, {
    withDiscount: entryOffer,
  })

  if (!offer) {
    throw new Error('Unknown offer')
  }

  const customer = await Payments.getInstance().getCustomerIdForCompany(
    ctx.user.id,
    offer.company,
  )

  const sess = await shop.generateCheckoutSession({
    offer: offer,
    customerId: customer.customerId,
    discounts: offer.discount?.couponId
      ? [offer.discount?.couponId]
      : undefined,
  })

  return {
    company: offer.company,
    clientSecret: sess.client_secret,
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
