import { forEachRow, Options, JobContext, JobFn } from '../../index'

const AGE_DAYS = 90

export default module.exports = function setup(options: Options, context: JobContext): JobFn {
  const { pgdb, debug } = context
  const { dryRun } = options
  const now = new Date()

  return async function () {
    const qryConditions = {
      'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
    }

    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')
      const batchHandler = async function (ids: string[]): Promise<void> {
        debug('delete %s rows', ids.length)
        handlerDebug('delete ids: %o', ids)

        await tx.public.accessEvents.delete({ id: ids })
      }

      await forEachRow(
        'accessEvents',
        qryConditions,
        options,
        { batchHandler },
        context,
      )

      await (dryRun && tx.transactionRollback()) || tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
