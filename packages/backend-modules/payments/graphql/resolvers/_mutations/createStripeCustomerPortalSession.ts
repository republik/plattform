import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PaymentProvider } from '../../../lib/providers/PaymentProvider'
import { ProjectRStripe, RepublikAGStripe } from '../../../lib/providers/stripe'
import { Company } from '../../../lib/types'
import { Payments } from '../../../lib/payments'
// const { Roles } = require('@orbiting/backend-modules-auth')

const RETURN_URL = `${process.env.FRONTEND_BASE_URL}/konto`

const Provider = new PaymentProvider({
  PROJECT_R: ProjectRStripe,
  REPUBLIK: RepublikAGStripe,
})

export = async function createStripeCustomerPortalSession(
  _root: never,
  args: { companyName: Company }, // eslint-disable-line @typescript-eslint/no-unused-vars
  ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  const { customerId } = await Payments.getInstance().getCustomerIdForCompany(
    ctx.user.id,
    args.companyName,
  )

  const sess = await Provider.forCompany(
    args.companyName,
  ).createCustomerPortalSession(customerId, {
    return_url: RETURN_URL,
    locale: 'de',
  })

  return {
    sessionUrl: sess.url,
  }
}
