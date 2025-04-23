import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Transaction } from '../../lib/types'

export = {
  // !TODO: Implement pledge resolver
  subscription(transaction: Transaction, _args: never, ctx: GraphqlContext) {
    return ctx.loaders.SubscriptionLoader.byId.load(transaction.subscriptionId)
  },
}
