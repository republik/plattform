import { forEachRow, Options, JobContext, JobFn } from '../../index'

// Both steps key off `expires_at`, set to `created_at` + 14 days when the link
// is created (GIFT_LINK_TTL_DAYS in backend-modules/gift-articles). A link is
// unlinked from its granter on the first daily run after it expires, and
// deleted DELETE_AFTER_DAYS after it expires.
const DELETE_AFTER_DAYS = 90

export default module.exports = function setup(
  options: Options,
  context: JobContext,
): JobFn {
  const { pgdb, debug } = context
  const { dryRun } = options
  const now = new Date()
  const deleteBefore = new Date(now)
  deleteBefore.setDate(deleteBefore.getDate() - DELETE_AFTER_DAYS)

  return async function () {
    const tx = await pgdb.transactionBegin()
    try {
      const handlerDebug = debug.extend('handler')

      // A run-out link no longer needs to know who handed it out.
      const unlinkHandler = async function (ids: string[]): Promise<void> {
        debug('unlink %i rows%s', ids.length, dryRun ? ' (dry-run only)' : '')
        handlerDebug('unlink ids%s: %o', dryRun ? ' (dry-run only)' : '', ids)

        await tx.public.gift_article_links.update(
          { id: ids },
          { granter_user_id: null },
        )
      }

      await forEachRow(
        'gift_article_links',
        { 'expires_at <': now, 'granter_user_id !=': null },
        options,
        { batchHandler: unlinkHandler },
        context,
      )

      const deleteHandler = async function (ids: string[]): Promise<void> {
        debug('delete %i rows%s', ids.length, dryRun ? ' (dry-run only)' : '')
        handlerDebug('delete ids%s: %o', dryRun ? ' (dry-run only)' : '', ids)

        await tx.public.gift_article_links.delete({ id: ids })
      }

      await forEachRow(
        'gift_article_links',
        { 'expires_at <': deleteBefore },
        options,
        { batchHandler: deleteHandler },
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
