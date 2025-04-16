import { GraphqlContext } from '@orbiting/backend-modules-types'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { Payments } from '../../../lib/payments'
import { Subscription } from '../../../lib/types'
import { PaymentService } from '../../../lib/services/PaymentService'

export = async function cancelMagazineSubscription(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  args: { subscriptionId: string; comment?: string }, // eslint-disable-line @typescript-eslint/no-unused-vars
  ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
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

  // TODO: Save cancelation reason

  await new PaymentService().updateSubscription(sub.company, sub.externalId, {
    cancel_at_period_end: true,
    cancellation_details: args.comment
      ? {
          comment: args.comment,
        }
      : undefined,
  })

  return true
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}
