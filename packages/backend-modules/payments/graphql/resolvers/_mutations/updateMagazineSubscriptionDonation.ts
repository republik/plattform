import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { getConfig } from '../../../lib/config'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'
import Stripe from 'stripe'
import { SubscriptionService } from '../../../lib/services/SubscriptionService'

type PriceData = Stripe.SubscriptionItemUpdateParams.PriceData

export = async function updateMagazineSubscriptionDonation(
  _root: never,
  args: {
    subscriptionId: string
    donationAmount: number
  },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const DONATION_PRODUCT_ID = getConfig().PROJECT_R_DONATION_PRODUCT_ID

  const sub = await new SubscriptionService(ctx.pgdb).getSubscription({
    id: args.subscriptionId,
  })
  if (!sub) {
    throw Error('api/unexpected')
  }
  if (sub.company !== 'PROJECT_R') {
    throw Error('api/payments/donationNotSupported')
  }

  Auth.Roles.ensureUserIsMeOrInRoles(
    await getSubscriptionOwner(ctx, sub),
    ctx.user,
    ['admin', 'supporter'],
  )

  const ps = new PaymentService()

  const items = await ps.listSubscriptionItems(sub.company, sub.externalId)

  const action: 'update' | 'delete' =
    args.donationAmount === 0 ? 'delete' : 'update'

  const existingDonation = findExistingProduct(items, DONATION_PRODUCT_ID)
  if (action === 'update' && existingDonation) {
    const priceData = makeYearlyRecurringPrice(
      DONATION_PRODUCT_ID,
      args.donationAmount,
    )
    await ps.updateSubscriptionItem(sub.company, existingDonation.id, {
      price_data: priceData,
      proration_behavior: 'none',
    })
  } else if (action === 'update') {
    const priceData = makeYearlyRecurringPrice(
      DONATION_PRODUCT_ID,
      args.donationAmount,
    )
    await ps.createSubscriptionItem(sub.company, {
      subscription: sub.externalId,
      price_data: priceData,
      proration_behavior: 'none',
    })
  }

  if (action === 'delete' && existingDonation) {
    await ps.deleteSubscriptionItem(sub.company, existingDonation.id)
  }

  return sub
}

function findExistingProduct(
  items: import('stripe').Stripe.SubscriptionItem[],
  productId: string,
) {
  return items.find((i) => i.price.product === productId)
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}

function makeYearlyRecurringPrice(product: string, amount: number): PriceData {
  if (amount <= 0) throw new Error('api/payments/error/invalidPriceAmount')

  return {
    product: product,
    unit_amount: amount,
    currency: 'chf',
    recurring: {
      interval: 'year',
    },
  }
}
