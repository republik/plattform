import { GraphqlContext } from '@orbiting/backend-modules-types'
import { UpgradeService } from '../../../lib/services/UpgradeService'
import Auth from '@orbiting/backend-modules-auth'

export = function cancelUpgradeMagazineSubscription(
  _root: never,
  args: { subscriptionId: string },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  return new UpgradeService(ctx.pgdb, ctx.logger).cancelSubscriptionUpgrade(
    ctx.user,
    args.subscriptionId,
  )
}
