import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PaymentProvider } from '../../../lib/providers/provider'
import { Company } from '../../../lib/types'
import { Payments } from '../../../lib/payments'
// const { Roles } = require('@orbiting/backend-modules-auth')

const RETURN_URL = `${process.env.FRONTEND_BASE_URL}/konto`

export = async function createStripeCustomerPortalSession(
  _root: never,
  args: { companyName: Company }, // eslint-disable-line @typescript-eslint/no-unused-vars
  ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
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
