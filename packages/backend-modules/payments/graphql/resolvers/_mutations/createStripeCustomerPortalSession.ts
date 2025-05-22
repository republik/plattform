import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Company } from '../../../lib/types'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { PaymentService } from '../../../lib/services/PaymentService'
import { CustomerInfoService } from '../../../lib/services/CustomerInfoService'

const RETURN_URL = `${process.env.FRONTEND_BASE_URL}/konto`

export = async function createStripeCustomerPortalSession(
  _root: never,
  args: { companyName: Company },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const customerId = (
    await new CustomerInfoService(ctx.pgdb).getCustomerIdForCompany(
      ctx.user.id,
      args.companyName,
    )
  )?.customerId

  if (!customerId) {
    return null
  }

  const sessUrl = await new PaymentService().createCustomerPortalSession(
    args.companyName,
    customerId,
    {
      returnUrl: RETURN_URL,
      locale: 'de',
    },
  )

  return {
    sessionUrl: sessUrl,
  }
}
