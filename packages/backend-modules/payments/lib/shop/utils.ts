import { PgDb } from 'pogi'
import { User } from '@orbiting/backend-modules-types'
import Stripe from 'stripe'
import { Discount, Offer, PriceDefinition, Promotion } from '../types'
import { SUBSCRIPTION_PRODUCTS } from '../constants'

export async function hasHadMembership(userId: string, pgdb: PgDb) {
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

export function requiredCustomFields(
  user?: User,
): Stripe.Checkout.SessionCreateParams.CustomField[] {
  if (!user?.firstName && !user?.lastName) {
    return [
      {
        key: 'firstName',
        type: 'text',
        optional: false,
        label: {
          custom: 'Vorname',
          type: 'custom',
        },
      },
      {
        key: 'lastName',
        type: 'text',
        optional: false,
        label: {
          custom: 'Nachname',
          type: 'custom',
        },
      },
    ]
  }

  return []
}

/**
 * Returns the code of the offer's default promotion if it is currently active.
 */
export function activeDefaultPromotionCode(
  offer: Pick<Offer, 'defaultPromotion'>,
  now: Date = new Date(),
): string | null {
  const promo = offer.defaultPromotion
  if (!promo) return null
  return now < promo.validUntil ? promo.code : null
}

export function promotionToDiscount(
  promotion: Stripe.PromotionCode,
): Promotion {
  return {
    id: promotion.id!,
    type: 'PROMO',
    name: promotion.coupon.name!,
    duration: promotion.coupon.duration,
    durationInMonths: promotion.coupon.duration_in_months,
    amountOff: promotion.coupon.amount_off!,
    currency: promotion.coupon.currency!,
  }
}

export function couponToDiscount(coupon: Stripe.Coupon): Discount {
  return {
    id: coupon.id!,
    type: 'DISCOUNT',
    name: coupon.name!,
    duration: coupon.duration,
    durationInMonths: coupon.duration_in_months,
    amountOff: coupon.amount_off!,
    currency: coupon.currency!,
  }
}

// There should be a nice way to do this. But for now this has to make do...
export function getAboPriceItem(
  i: Stripe.SubscriptionItem | Stripe.InvoiceItem | Stripe.InvoiceLineItem,
) {
  if (i.object === 'subscription_item' && typeof i.price.product === 'string') {
    return SUBSCRIPTION_PRODUCTS.includes(i.price.product)
  }
  if (i.object === 'subscription_item' && typeof i.price.product === 'object') {
    return SUBSCRIPTION_PRODUCTS.includes(i.price.product.id)
  }
  if (
    i.object === 'invoiceitem' &&
    typeof i.pricing?.price_details?.product === 'string'
  ) {
    return SUBSCRIPTION_PRODUCTS.includes(i.pricing?.price_details?.product)
  }
  if (
    i.object === 'invoiceitem' &&
    typeof i.pricing?.price_details?.product === 'string'
  ) {
    return SUBSCRIPTION_PRODUCTS.includes(i.pricing?.price_details?.product)
  }
  if (
    i.object === 'line_item' &&
    typeof i.pricing?.price_details?.product === 'string'
  ) {
    return SUBSCRIPTION_PRODUCTS.includes(
      i.pricing?.price_details?.product as string,
    )
  }
}

/** All lookup keys to fetch for the given items, incl. fallbacks */
export function lookupKeysForItems(items: PriceDefinition[]): string[] {
  return items.flatMap((i) =>
    i.fallbackLookupKey ? [i.lookupKey, i.fallbackLookupKey] : [i.lookupKey],
  )
}

/** The price for an item: its lookup key, otherwise its fallback lookup key */
export function priceForItem<T extends { lookup_key: string | null }>(
  prices: T[],
  item: PriceDefinition,
): T | undefined {
  return (
    prices.find((p) => p.lookup_key === item.lookupKey) ??
    (item.fallbackLookupKey
      ? prices.find((p) => p.lookup_key === item.fallbackLookupKey)
      : undefined)
  )
}
