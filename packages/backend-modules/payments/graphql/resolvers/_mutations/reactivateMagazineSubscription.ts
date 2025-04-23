import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Payments } from '../../../lib/payments'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'
import { CancelationService } from '../../../lib/services/CancelationService'

export = async function cancelMagazineSubscription(
  _root: never,
  args: { subscriptionId: string },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const sub = await Payments.getInstance().getSubscription({
    id: args.subscriptionId,
  })
  if (!sub) {
    throw Error('api/unexpected')
  }

  Auth.Roles.ensureUserIsMeOrInRoles(
    await getSubscriptionOwner(ctx, sub),
    ctx.user,
    ['admin', 'supporter'],
  )

  const cs = new CancelationService(new PaymentService(), ctx.pgdb)

  cs.revokeCancelation(sub)

  return true
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}
