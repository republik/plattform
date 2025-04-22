import { Transaction } from '../../lib/types'

export = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __resolveType: (transaction: Transaction, _args: never, _context: never) => {
    if (transaction.subscriptionId) {
      return 'SubscriptionTransaction'
    }

    if (transaction.pledgeId) {
      return 'PledgeTransaction'
    }

    console.log(transaction)

    throw new Error('api/unknown')
  },
}
