import { forEachRow, Options, JobContext, JobFn } from '../../index'

// old audio queue items should be deleted if the audio queue is very long
const AGE_DAYS = 90
const MAX_ITEMS = 50

export = async function setup(
  options: Options,
  context: JobContext,
): Promise<JobFn> {
  const { pgdb, debug } = context
  const { dryRun } = options
  const now = new Date()

  const collection = await pgdb.public.collections.findOne({
    name: 'audioqueue',
  })

  return async function () {
    const qryConditions = {
      collectionId: collection.id, 
      'updatedAt <': now.setDate(now.getDate() - AGE_DAYS),
      'data ?': 'sequence',
      'data->sequence >': MAX_ITEMS,
    }

    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')
      const batchHandler = async function (ids: string[]): Promise<void> {
        debug('update %i rows%s', ids.length, dryRun ? ' (dry-run only)' : '')
        handlerDebug('update ids%s: %o', dryRun ? ' (dry-run only)' : '', ids)

        await tx.public.collectionDocumentItems.delete({ id: ids })
      }

      await forEachRow(
        'collectionDocumentItems',
        qryConditions,
        options,
        { batchHandler },
        context,
      )

      if (!dryRun) {
        await tx.transactionCommit()
      } else {
        await tx.transactionRollback()
      }
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
