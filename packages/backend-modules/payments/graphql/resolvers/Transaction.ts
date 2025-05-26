import { Transaction } from '../../lib/types'

export = {
  __resolveType: (transaction: Transaction, _args: never, _context: never) => {
    if (transaction.subscriptionId) {
      return 'SubscriptionTransaction'
    }

    if (transaction.pledgeId) {
      return 'PledgeTransaction'
    }

    throw new Error('api/unknown')
  },
}
