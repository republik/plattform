import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Payments } from '../../../lib/payments'
import { PaymentService } from '../../../lib/services/PaymentService'
import { Subscription } from '../../../lib/types'

export = async function cancelMagazineSubscription(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  args: { subscriptionId: string }, // eslint-disable-line @typescript-eslint/no-unused-vars
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

  await new PaymentService().updateSubscription(sub.company, sub.externalId, {
    cancel_at_period_end: false,
  })

  return true
}

async function getSubscriptionOwner(ctx: GraphqlContext, sub: Subscription) {
  return await ctx.pgdb.public.users.findOne({ id: sub.userId })
}
