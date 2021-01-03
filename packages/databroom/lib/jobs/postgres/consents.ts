import { forEachRow, Options, JobContext, JobFn } from '../../index'

interface Consent {
  id: string
}

const AGE_DAYS = 365

export default module.exports = function setup(options: Options, context: JobContext): JobFn {
  const { pgdb, debug } = context
  const { dryRun } = options
  const now = new Date()

  return async function() {
    const qryConditions = {
      'createdAt <': now.setDate(now.getDate() - AGE_DAYS),
      'ip !=': null,
    }

    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')
      const handler = async function (row: Consent): Promise<void> {
        handlerDebug('set ip to null on %s', row.id)

        if (!dryRun) {
          await tx.public.consents.update(
            { id: row.id },
            { ip: null }
          )
        }
      }

      await forEachRow(
        'consents',
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
