// SANITY_SYNC (transition period, removable).
//
// Mirrors publikator commits/publishes/unpublishes into Sanity as drafts (or
// published docs), for the period where editors still author in Publikator
// but Sanity Studio should stay populated and previewable. Entirely
// self-contained: to remove this feature once the real cutover migration
// ships, delete this directory, drop the `SANITY_SYNC` call sites in
// publikator's commit/publish/unpublish mutations, remove
// `PublikatorSyncWorker` from apps/api/server.js's worker list, and drop the
// SANITY_SYNC_FROM_PUBLIKATOR_ENABLED env var. See the plan this implements
// for the full scope decision (only the article's own text is mirrored, not
// collections/teasers/section wiring).
import { logger } from '@orbiting/backend-modules-logger'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { PublikatorSyncPayload, SYNC_JOB_OPTIONS } from './worker'

export const isSyncFromPublikatorEnabled = () =>
  process.env.SANITY_SYNC_FROM_PUBLIKATOR_ENABLED === 'true'

// Never throws: this is a best-effort mirror, called from inside
// publikator's commit/publish/unpublish mutations, sometimes after their own
// Postgres transaction has already committed. A queue hiccup here must never
// turn an already-successful commit/publish/unpublish into a client-facing
// error (or, worse, trigger a rollback attempt on a transaction that already
// committed) — see the sync integration review. Failures are logged and
// swallowed; the next commit will simply try again.
export async function enqueueSyncFromPublikator(
  data: Omit<PublikatorSyncPayload, '$version'>,
) {
  if (!isSyncFromPublikatorEnabled()) return
  try {
    await Queue.getInstance().send(
      'sanity:sync-from-publikator',
      { $version: 'v1', ...data } as PublikatorSyncPayload,
      // Debounce bursts of quick commits (Publikator's editor autosaves) to
      // one sync per repo per window, rather than piling up a job — and thus
      // a full image re-upload — per keystroke-adjacent save. Only for
      // 'commit': the worker re-reads whatever is latest when it runs, so a
      // debounced/dropped duplicate never loses data (see worker.ts).
      // publish/unpublish are explicit, infrequent user actions — always
      // enqueued as-is (passing `undefined` here falls back to
      // SYNC_JOB_OPTIONS inside Queue.send itself).
      //
      // Spreads SYNC_JOB_OPTIONS in rather than passing singletonKey alone:
      // Queue.send does `options ?? worker.options`, so *any* explicit
      // options object here replaces the worker's configured retry policy
      // rather than merging with it — passing singletonKey alone would
      // silently drop retryLimit/retryDelay for commit jobs only.
      data.action === 'commit'
        ? {
            ...SYNC_JOB_OPTIONS,
            singletonKey: `commit:${data.repoId}`,
            singletonSeconds: 15,
          }
        : undefined,
    )
  } catch (error) {
    logger.error(
      { error, ...data },
      'sanity sync: failed to enqueue publikator sync job',
    )
  }
}

export { PublikatorSyncWorker } from './worker'
export { isArticleLikeMeta } from './eligibility'
export type { PublikatorMetaLike } from './eligibility'
