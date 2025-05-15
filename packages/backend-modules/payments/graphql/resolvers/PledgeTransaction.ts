import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Transaction } from '../../lib/types'

export = {
  pledge(transaction: Transaction, _args: never, ctx: GraphqlContext) {
    return ctx.loaders.PledgeLoader.byId.load(transaction.pledgeId)
  },
}
