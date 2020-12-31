import { mapPogiTable, Options, DatabroomContext, Job } from '../../index'

interface AccessEvent {
  id: string
}

const AGE_DAYS = 90
const NICE_ROW_LIMIT = 100

export default module.exports = function setup(options: Options, context: DatabroomContext): Job {
  const { pgdb, debug } = context
  const { dryRun, nice } = options
  const now = new Date()

  return {
    async clean() {
      const qryConditions = {
        'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
      }

      const qryOptions = {
        ...nice && { limit: NICE_ROW_LIMIT }
      }

      const tx = await pgdb.transactionBegin()
      try {
        const handlerDebug = debug.extend('handler')
        const handler = async function (row: AccessEvent): Promise<void> {
          handlerDebug('delete %s', row.id)

          if (!dryRun) {
            await tx.public.accessEvents.delete({ id: row.id })
          }
        }

        await mapPogiTable(
          'accessEvents',
          qryConditions,
          qryOptions,
          handler,
          context,
        )

        await tx.transactionCommit()
      } catch (e) {
        await tx.transactionRollback()
        throw e
      }
    },
  }
}
