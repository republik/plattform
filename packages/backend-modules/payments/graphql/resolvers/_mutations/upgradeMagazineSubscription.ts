import { GraphqlContext } from '@orbiting/backend-modules-types'
import { UpgradeService } from '../../../lib/services/UpgradeService'

export = function upgradeMagazineSubscription(
  _root: never,
  args: { upgradeInput: { subscriptionId: string } },
  ctx: GraphqlContext,
) {
  return new UpgradeService(ctx.pgdb, ctx.logger).scheduleSubscriptionUpgrade(
    args.upgradeInput.subscriptionId,
  )
}
