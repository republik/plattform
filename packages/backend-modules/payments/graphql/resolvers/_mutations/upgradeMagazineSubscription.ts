import { GraphqlContext } from '@orbiting/backend-modules-types'
import { UpgradeService } from '../../../lib/services/UpgradeService'
import Auth from '@orbiting/backend-modules-auth'

export = function upgradeMagazineSubscription(
  _root: never,
  args: { upgradeInput: { subscriptionId: string } },
  ctx: GraphqlContext,
) {
  Auth.ensureUser(ctx.user)

  return new UpgradeService(ctx.pgdb, ctx.logger).scheduleSubscriptionUpgrade(
    ctx.user,
    args.upgradeInput.subscriptionId,
  )
}
