import { forEachRow, Options, JobContext, JobFn } from '../../index'

interface PaymentsLog {
  id: string
}

const AGE_DAYS = 90
const NICE_ROW_LIMIT = 100

export default module.exports = function setup(options: Options, context: JobContext): JobFn {
  const { pgdb, debug } = context
  const { dryRun, nice } = options
  const now = new Date()

  return async function() {
    const qryConditions = {
      'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
    }

    const qryOptions = {
      ...nice && { limit: NICE_ROW_LIMIT }
    }

    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')
      const handler = async function (row: PaymentsLog): Promise<void> {
        handlerDebug('delete %s', row.id)

        if (!dryRun) {
          await tx.public.paymentsLog.delete({ id: row.id })
        }
      }

      await forEachRow(
        'paymentsLog',
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
  }
}
