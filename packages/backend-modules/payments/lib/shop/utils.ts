import { PgDb } from 'pogi'
import { User } from '@orbiting/backend-modules-types'
import Stripe from 'stripe'
import { Discount, Promotion } from '../types'

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
