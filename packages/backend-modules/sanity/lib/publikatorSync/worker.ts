// SANITY_SYNC (transition period, removable — see ./index.ts).
import { BaseWorker, Job } from '@orbiting/backend-modules-job-queue'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { SendOptions } from 'pg-boss'
import { sanityClient } from '../client'
import { repoIdToSanityId } from '../legacyId'
import {
  buildDraftArticleDoc,
  DraftArticleDoc,
  PublikatorCommit,
  resolveFormatRepoId,
} from './articleDoc'
import { resolveAssetMarkers } from './assets'
import { DiscussionRef, linkLegacyDiscussion } from './discussionRef'
import { isArticleLikeMeta } from './eligibility'
import { resolveFormatTeaserImage } from './formatTeaserImage'
import { linkLegacySyntheticAudio } from './legacyAudio'

export type PublikatorSyncPayload =
  | { $version: 'v1'; repoId: string; action: 'commit' }
  | { $version: 'v1'; repoId: string; commitId: string; action: 'publish' }
  | { $version: 'v1'; repoId: string; action: 'unpublish' }

// Shared with ./index.ts's singletonKey debounce options for the 'commit'
// action: Queue.send() does `options ?? worker.options` — passing an
// explicit options object at the call site replaces this entirely rather
// than merging with it, so index.ts must spread this in, not just add
// singletonKey/singletonSeconds alongside a bare object, or commit jobs
// would silently lose their retry policy.
export const SYNC_JOB_OPTIONS: SendOptions = { retryLimit: 3, retryDelay: 5 }

// Background counterpart to publikator's commit/publish/unpublish mutations —
// enqueued (never awaited inline) so a Sanity write never adds latency to
// those requests. Always re-derives the Sanity document from Postgres (or,
// for unpublish, from Sanity's own current published doc), never trusting
// more than `{repoId, action}` (`commitId` too, for publish — that one
// targets an exact, editor-chosen commit, not "whatever's latest") — mirrors
// the self-heal pattern in ../audio.ts (safe to retry/redeliver).
//
// The 'commit' action deliberately re-reads the *latest* commit for the repo
// rather than the one that triggered the job: pg-boss gives no ordering
// guarantee between two jobs for the same repo (see the sync integration
// review), so a burst of quick edits could otherwise apply out of order and
// leave the draft behind an older commit. Always converging on "whatever is
// latest right now" makes ordering irrelevant.
export class PublikatorSyncWorker extends BaseWorker<PublikatorSyncPayload> {
  readonly queue = 'sanity:sync-from-publikator'
  readonly options: SendOptions = SYNC_JOB_OPTIONS

  async perform(jobs: Job<PublikatorSyncPayload>[]) {
    for (const job of jobs) {
      if (job.data.$version !== 'v1') {
        throw Error('unable to perform this job version. Expected v1')
      }
      await this.sync(job.data)
    }
  }

  private async sync(data: PublikatorSyncPayload) {
    const { pgdb } = this.context as ConnectionContext
    const id = repoIdToSanityId(data.repoId)
    const draftId = `drafts.${id}`

    if (data.action === 'unpublish') {
      // No commit to re-derive from here (publikator's unpublish mutation
      // only takes a repoId) — mirror whatever is currently live in Sanity
      // back into a draft, matching Publikator's own unpublish semantics
      // (content stays, just goes offline). Only ever touch a document this
      // hook could plausibly have created (see eligibility.ts) — never a
      // `page`/`front`/`articleCollection`/etc. the real migration owns.
      const published = await sanityClient().getDocument(id)
      if (!published || published._type !== 'article') return
      const { _id, _rev, _createdAt, _updatedAt, _type, ...fields } =
        published as Record<string, unknown> & { _type: string }
      await sanityClient().createOrReplace({ _id: draftId, _type, ...fields })
      await this.deleteIfExists(id)
      return
    }

    const commit = (await this.fetchCommit(pgdb, data)) as
      | PublikatorCommit
      | undefined

    if (!commit) {
      this.logger.error(
        { repoId: data.repoId, action: data.action },
        'sanity sync: commit not found',
      )
      return
    }

    // `isTemplate` lives on the *repo* record (publikator.repos.meta),
    // never on the commit row — commit.js's own validation reads it the
    // same way (`args.isTemplate`, persisted once via `repos.insert`).
    // Re-fetched here (not trusted from the caller) for the same
    // self-heal reasons as the commit lookup above — this is the only
    // place that reliably catches a template for the 'publish' action
    // too, since publish.js has no isTemplate arg of its own to gate on.
    const repo = await pgdb.publikator.repos.findOne(
      { id: data.repoId },
      { fields: ['meta'] },
    )

    if (
      !isArticleLikeMeta({ ...commit.meta, isTemplate: repo?.meta?.isTemplate })
    ) {
      // Not an article-shaped repo (format/section/page/front/series
      // overview/template) — out of scope for this transition mirror, and
      // writing `_type: 'article'` at its id would permanently collide with
      // whatever type the real migration gives it later. Silently skip.
      return
    }

    // buildDraftArticleDoc leaves image fields as `_sanityAsset` markers
    // (studio's migration-tool convention) — resolveAssetMarkers uploads
    // each one and rewrites it into a real asset reference. See the header
    // comment in ./assets.ts for why this can't be skipped: the plain
    // content API doesn't understand that marker the way @sanity/import does.
    //
    // The format-image fallback runs before resolveAssetMarkers so any
    // `_sanityAsset` marker it adds still gets uploaded in the same sweep.
    const draft = buildDraftArticleDoc(commit, repo?.meta)
    const withFormatImage = await this.resolveFormatTeaserImageSafely(
      draft,
      resolveFormatRepoId(commit.meta),
      pgdb,
    )
    const doc = await resolveAssetMarkers(withFormatImage)

    if (data.action === 'commit') {
      const draftDoc = await this.linkLegacyAudioSafely(
        doc,
        commit.id,
        draftId,
        pgdb,
      )
      await sanityClient().createOrReplace({ _id: draftId, ...draftDoc })
      return
    }

    // publish: the published doc goes live, the draft companion is removed.
    // Deliberately two separate calls, not one atomic transaction — see
    // deleteIfExists below for why.
    //
    // The discussion is linked synchronously, here, rather than left to
    // Sanity's own create-discussion Blueprint Function: that function
    // creates a BRAND NEW discussion doc for any published article with no
    // `discussion` ref yet, with no awareness of a pre-existing legacy
    // Postgres discussion for this repoId (upserted by publikator's publish
    // resolver before this job's enqueue — see publish.js's
    // prepareMetaForPublish). Left to that function, migrated content ends
    // up with two competing discussions: the real one (existing comments,
    // settings) and an orphaned empty one. Linking it here, before this
    // createOrReplace, means `discussion` is already defined by the time
    // that function's trigger condition would be checked.
    const publishedDoc = await this.linkLegacyAudioSafely(
      doc,
      commit.id,
      id,
      pgdb,
    )
    const discussionRef = await this.linkLegacyDiscussionSafely(
      data.repoId,
      id,
      pgdb,
    )
    await sanityClient().createOrReplace({
      _id: id,
      ...publishedDoc,
      ...(discussionRef ? { discussion: discussionRef } : {}),
    })
    await this.deleteIfExists(draftId)
  }

  // Best-effort, same reasoning as linkLegacyAudioSafely below: a missing/
  // unpublished format, or a transient Postgres hiccup in this lookup, must
  // never fail the whole sync job and block the article's own text/content
  // from mirroring for a reason that has nothing to do with that content —
  // the article just keeps whatever teaserSmall.image it already had (its
  // own, or none).
  private async resolveFormatTeaserImageSafely(
    doc: DraftArticleDoc,
    formatRepoId: string | undefined,
    pgdb: ConnectionContext['pgdb'],
  ): Promise<DraftArticleDoc> {
    try {
      return await resolveFormatTeaserImage(doc, formatRepoId, pgdb)
    } catch (error) {
      this.logger.warn(
        { error, formatRepoId },
        'sanity sync: format teaser-image fallback failed (article content still synced)',
      )
      return doc
    }
  }

  // Best-effort, same reasoning as deleteIfExists below: a transient
  // Sanity/Postgres hiccup in this audio side-channel (fetchAudioContentHash,
  // the derivatives lookup) must never fail the whole sync job and block the
  // article's own text/content from mirroring for a reason that has nothing
  // to do with that content.
  private async linkLegacyAudioSafely(
    doc: DraftArticleDoc,
    commitId: string | undefined,
    sanityDocId: string,
    pgdb: ConnectionContext['pgdb'],
  ): Promise<DraftArticleDoc> {
    try {
      return await linkLegacySyntheticAudio(doc, commitId, sanityDocId, pgdb)
    } catch (error) {
      this.logger.warn(
        { error, sanityDocId },
        'sanity sync: legacy audio link failed (article content still synced)',
      )
      return doc
    }
  }

  // Best-effort, same reasoning as linkLegacyAudioSafely above: a transient
  // Sanity/Postgres hiccup while linking the legacy discussion must never
  // fail the whole sync job and block the article's own content from
  // mirroring for a reason that has nothing to do with that content. Falls
  // through to Sanity's own create-discussion Function (which may then
  // create an orphaned discussion) only on failure — self-heals on the next
  // publish, same as every other best-effort step in this file.
  private async linkLegacyDiscussionSafely(
    repoId: string,
    articleSanityId: string,
    pgdb: ConnectionContext['pgdb'],
  ): Promise<DiscussionRef | undefined> {
    try {
      return await linkLegacyDiscussion(pgdb, repoId, articleSanityId)
    } catch (error) {
      this.logger.warn(
        { error, articleSanityId },
        'sanity sync: legacy discussion link failed (article content still synced)',
      )
      return undefined
    }
  }

  // A plain delete() mutation is normally idempotent against a missing
  // document — but that's not something worth staking this hook's
  // correctness on. If this repo's *first* sync ever happens to be a
  // publish (e.g. the feature was only just enabled, or a retried job runs
  // after something else already cleaned the companion doc up), the
  // draft/published companion this call targets may simply not exist. Since
  // this cleanup is cosmetic — the important write (the published doc, or
  // the reverted draft on unpublish) already happened in the call before
  // this one — any failure here is logged and swallowed rather than thrown,
  // so it can never turn a real, successful write into a failed/retried job.
  private async deleteIfExists(id: string) {
    try {
      await sanityClient().delete(id)
    } catch (error) {
      this.logger.warn(
        { error, id },
        'sanity sync: cleanup delete failed (document may not have existed)',
      )
    }
  }

  private fetchCommit(
    pgdb: ConnectionContext['pgdb'],
    data: PublikatorSyncPayload,
  ) {
    if (data.action === 'publish') {
      return pgdb.publikator.commits.findOne({
        id: data.commitId,
        repoId: data.repoId,
      })
    }

    // 'commit': always the latest commit for the repo — see class comment.
    // Matches the same "latest commit for a repo" idiom already used
    // elsewhere in this package, e.g.
    // script/migrateAudioSources.ts's `latestCommit` lookup.
    return pgdb.publikator.commits.findOne(
      { repoId: data.repoId },
      { orderBy: { createdAt: 'desc' }, limit: 1 },
    )
  }
}
