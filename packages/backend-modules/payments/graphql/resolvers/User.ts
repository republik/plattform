import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { Company, USER_VISIBLE_STATUS_TYPES } from '../../lib/types'
import { Payments } from '../../lib/payments'
const { Roles } = require('@orbiting/backend-modules-auth')

export = {
  async stripeCustomer(
    user: User,
    { company }: { company: Company },
    ctx: GraphqlContext,
  ) {
    Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
    await Payments.getInstance().ensureUserHasCustomerIds(user.id)

    return await Payments.getInstance().getCustomerIdForCompany(
      user.id,
      company,
    )
  },

  async activeMagazineSubscription(
    user: User,
    _args: never,
    ctx: GraphqlContext,
  ) {
    Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])

    try {
      const res = await Payments.getInstance().fetchActiveSubscription(user.id)
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  },

  async magazineSubscriptions(user: User, _args: never, ctx: GraphqlContext) {
    Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
    try {
      const res = await Payments.getInstance().listSubscriptions(
        user.id,
        USER_VISIBLE_STATUS_TYPES,
      )
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  },
}
