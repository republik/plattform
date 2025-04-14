import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Payments } from '../../../lib/payments'
import { getConfig } from '../../../lib/config'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'
import Stripe from 'stripe'

type PriceData = Stripe.SubscriptionItemUpdateParams.PriceData

export = async function updateMagazineSubscriptionDonation(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  args: {
    subscriptionId: string
    selectedDonation?: string
    customDonation?: { amount: number }
  }, // eslint-disable-line @typescript-eslint/no-unused-vars
  ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  Auth.ensureUser(ctx.user)
  if (args.selectedDonation && args.customDonation) {
    throw new Error(
      'api/payments/error/exclusiveOptions/selectedDonationANDcustomDonation',
    )
  }

  const DONATION_PRODUCT_ID = getConfig().PROJECT_R_DONATION_PRODUCT_ID

  const sub = await Payments.getInstance().getSubscription({
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

  let price: string | undefined = undefined
  let priceData: PriceData | undefined = undefined
  if (args.selectedDonation) {
    const [res] = await ps.getPrices(sub.company, [args.selectedDonation])

    price = isPriceOfProduct(res, DONATION_PRODUCT_ID) ? res.id : undefined
  }
  if (args.customDonation) {
    priceData = makeYearlyRecurringPrice(
      DONATION_PRODUCT_ID,
      args.customDonation.amount,
    )
  }

  if (!price && !priceData) throw new Error('api/unexpected/invalidPrice')

  const existingDonation = findExistingProduct(items, DONATION_PRODUCT_ID)
  if (existingDonation) {
    await ps.updateSubscriptionItem(sub.company, existingDonation.id, {
      price: price,
      price_data: priceData,
      proration_behavior: 'none',
    })
  } else {
    await ps.createSubscriptionItem(sub.company, {
      subscription: sub.externalId,
      price: price,
      price_data: priceData,
      proration_behavior: 'none',
    })
  }

  return true
}

function findExistingProduct(
  items: import('stripe').Stripe.SubscriptionItem[],
  DONATION_PRODUCT_ID: string,
) {
  return items.find((i) => i.price.product === DONATION_PRODUCT_ID)
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}

function isPriceOfProduct(res: Stripe.Price, productId: string) {
  if (typeof res.product === 'string') {
    return res.product === productId
  } else {
    return res.product.id === productId
  }
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
