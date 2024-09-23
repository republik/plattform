import { GraphqlContext } from '@orbiting/backend-modules-types'
// import { Payments } from '../../../lib/payments'
// const { Roles } = require('@orbiting/backend-modules-auth')

export = async function cancelMagazineSubscription(
  _subscriptionId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  _args: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  _ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // TODO: Allow subscription cancelation
  // Payments.getInstance().findSubscription(subscriptionId)
  // Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
  return false
}
