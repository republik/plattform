import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { Company } from '../../lib/types'
import { Payments } from '../../lib/payments'
const { Roles } = require('@orbiting/backend-modules-auth')

export = {
  async stripeCustomer(
    user: User,
    { company }: { company: Company },
    ctx: GraphqlContext,
  ) {
    Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
    const PaymentsService = Payments.getInstance()

    return PaymentsService.getCustomerIdForCompany(user.id, company)
  },
}
