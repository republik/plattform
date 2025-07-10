import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'
import {
  CancallationSlackNotifier,
  CancellationService,
} from '../../../lib/services/CancellationService'
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
    throw new Error('api/unexpected')
  }

  const owner = await getSubscriptionOwner(ctx, sub)
  if (!owner) {
    throw new Error('api/unexpected')
  }

  Auth.Roles.ensureUserIsMeOrInRoles(owner, ctx.user, ['admin', 'supporter'])

  const cs = new CancellationService(new PaymentService(), ctx.pgdb, [
    new CancallationSlackNotifier(),
  ])

  return cs.revokeCancellation(ctx.user, owner, sub)
}

async function getSubscriptionOwner(
  ctx: GraphqlContext,
  sub: Subscription,
): Promise<User | null> {
  const row = await ctx.pgdb.public.users.findOne({ id: sub.userId })
  return Auth.transformUser(row)
}
