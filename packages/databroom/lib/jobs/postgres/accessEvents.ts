import { Context } from '@orbiting/backend-modules-types'

import { Options, Job } from '../../index'

const AGE_DAYS = 90

export default module.exports = function setup(options: Options, context: Context): Job {
  const { dryRun } = options
  const now = new Date()

  return {
    async clean() {
      const { pgdb } = context

      const tx = await pgdb.transactionBegin()
      try {
        const conditions = {
          'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
        }

        const count = await pgdb.public.accessEvents.count(conditions)

        if (!dryRun && count > 0) {
          console.log('delete')
        }

        await tx.transactionCommit()
      } catch (e) {
        await tx.transactionRollback()
        throw e
      }
    },
  }
}
