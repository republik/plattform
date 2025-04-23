import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { Payments } from '../../../lib/payments'
import { Subscription } from '../../../lib/types'
import { PaymentService } from '../../../lib/services/PaymentService'
import { CancelationService } from '../../../lib/services/CancelationService'

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

  const details = args.details

  const actorIsSupport = isSupportActor(sub.userId, ctx.user)

  await cs.cancelSubscription(
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

  return true
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}

function isSupportActor(userId: string, user: User) {
  if (!user.roles.includes('admin') && !user.roles.includes('supporter')) {
    return false
  }

  return userId !== user.id
}
