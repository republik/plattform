import { GraphqlContext } from '@orbiting/backend-modules-types'
// import { Payments } from '../../../lib/payments'
// import { default as Auth } from '@orbiting/backend-modules-auth'

export = async function cancelMagazineSubscription(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  _args: { subscriptionId: string }, // eslint-disable-line @typescript-eslint/no-unused-vars
  _ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // Auth.Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
  // Payments.getInstance().findSubscription(subscriptionId)
  return false
}
