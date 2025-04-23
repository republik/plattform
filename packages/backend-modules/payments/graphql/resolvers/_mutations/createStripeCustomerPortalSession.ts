import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PaymentProvider } from '../../../lib/providers/provider'
import { Company } from '../../../lib/types'
import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'

const RETURN_URL = `${process.env.FRONTEND_BASE_URL}/konto`

export = async function createStripeCustomerPortalSession(
  _root: never,
  args: { companyName: Company },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const customerId = (
    await Payments.getInstance().getCustomerIdForCompany(
      ctx.user.id,
      args.companyName,
    )
  )?.customerId

  if (!customerId) {
    return null
  }

  const sessUrl = await PaymentProvider.forCompany(
    args.companyName,
  ).createCustomerPortalSession(customerId, {
    returnUrl: RETURN_URL,
    locale: 'de',
  })

  return {
    sessionUrl: sessUrl,
  }
}
