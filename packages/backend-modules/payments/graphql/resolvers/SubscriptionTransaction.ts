import { Transaction } from '../../lib/types'

export = {
  // !TODO: Implement pledge resolver
  subscription(_transaction: Transaction, _args: never, _context: never) {
    throw new Error('api/backend-todo')
  },
}
