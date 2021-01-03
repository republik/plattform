import { forEachRow, Options, JobContext, JobFn } from '../../index'

interface EventLog {
  id: string
}

const AGE_DAYS = 90

export default module.exports = function setup(options: Options, context: JobContext): JobFn {
  const { pgdb, debug } = context
  const { dryRun } = options
  const now = new Date()

  return async function() {
    const qryConditions = {
      'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
    }

    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')
      const handler = async function (row: EventLog): Promise<void> {
        handlerDebug('delete %s', row.id)

        if (!dryRun) {
          await tx.public.eventLog.delete({ id: row.id })
        }
      }

      await forEachRow(
        'eventLog',
        qryConditions,
        options,
        handler,
        context,
      )

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
