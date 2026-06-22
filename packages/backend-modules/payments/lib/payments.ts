import { Company } from './types'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { CustomerInfoService } from './services/CustomerInfoService'
import auth from '@orbiting/backend-modules-auth'
import { ProjectRStripe, RepublikAGStripe } from './providers/stripe'
import type Stripe from 'stripe'

export const Companies: readonly Company[] = ['PROJECT_R', 'REPUBLIK'] as const

export function setupPaymentUserEventHooks(context: ConnectionContext) {
  const cs = new CustomerInfoService(context.pgdb)

  auth.UserEvents.onSignedIn(async ({ userId }: { userId: string }) => {
    if (process.env.PAYMENTS_CREATE_CUSTOMERS_ON_LOGIN === 'true') {
      await cs.ensureUserHasCustomerIds(userId)
    }
  })

  auth.UserEvents.onEmailUpdated(
    async (args: { userId: string; newEmail: string }) => {
      await Promise.all(
        Companies.map((c) =>
          cs.updateCustomerEmail(c, args.userId, args.newEmail),
        ),
      )
    },
  )
}

export const stripeProviders: Record<Company, Stripe> = {
  PROJECT_R: ProjectRStripe,
  REPUBLIK: RepublikAGStripe,
}

export type { Company }
