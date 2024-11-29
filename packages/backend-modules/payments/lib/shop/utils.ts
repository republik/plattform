import { PgDb } from 'pogi'
import { User } from '@orbiting/backend-modules-types'
import Stripe from 'stripe'

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
