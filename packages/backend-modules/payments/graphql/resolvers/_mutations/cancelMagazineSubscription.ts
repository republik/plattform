import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { Subscription } from '../../../lib/types'
import { PaymentService } from '../../../lib/services/PaymentService'
import {
  CancallationSlackNotifier,
  CancellationService,
} from '../../../lib/services/CancellationService'
import { SubscriptionService } from '../../../lib/services/SubscriptionService'

type CancellationInput = {
  type: string
  reason?: string
  suppressConfirmation?: boolean
  suppressWinback?: boolean
}

export = async function cancelMagazineSubscription(
  _root: never,
  args: {
    subscriptionId: string
    cancelImmediately: boolean
    details: CancellationInput
  },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  const sub = await new SubscriptionService(ctx.pgdb).getSubscription({
    id: args.subscriptionId,
  })
  if (!sub) {
    throw Error('api/unexpected')
  }

  const owner = await getSubscriptionOwner(ctx, sub)
  if (!owner) {
    throw Error('api/unexpected')
  }

  Auth.Roles.ensureUserIsMeOrInRoles(owner, ctx.user, ['admin', 'supporter'])

  const cs = new CancellationService(new PaymentService(), ctx.pgdb, [
    new CancallationSlackNotifier(),
  ])

  const details = args.details

  const actorIsSupport = isSupportActor(ctx.user, owner)

  return cs.cancelSubscription(
    ctx.user,
    owner,
    sub,
    {
      category: details.type,
      reason: details.reason,
      suppressConfirmation: details.suppressConfirmation,
      suppressWinback: details.suppressWinback,
      cancelledViaSupport: actorIsSupport,
    },
    // only support or admin can cancel immediately
    args.cancelImmediately && actorIsSupport,
  )
}

async function getSubscriptionOwner(
  ctx: GraphqlContext,
  sub: Subscription,
): Promise<User | null> {
  const row = await ctx.pgdb.public.users.findOne({ id: sub.userId })
  return Auth.transformUser(row)
}

function isSupportActor(actor: User, owner: User) {
  if (!actor.roles.includes('admin') && !actor.roles.includes('supporter')) {
    return false
  }

  return actor.id !== owner.id
}
