import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'
import { CancellationService } from '../../../lib/services/CancellationService'
import { SubscriptionService } from '../../../lib/services/SubscriptionService'

export = async function cancelMagazineSubscription(
  _root: never,
  args: { subscriptionId: string },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const sub = await new SubscriptionService(ctx.pgdb).getSubscription({
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

  const cs = new CancellationService(new PaymentService(), ctx.pgdb)

  return cs.revokeCancellation(sub)
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}
