import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { fetchDiscussionRefsByIds, legacySanityId } from '@orbiting/backend-modules-sanity'

export class ReadingPositionRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads:reading_position'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.reading_progress_last_6_months;
    `)

    return
  }
}

export class NextReadsFeedRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads:feed:refresh'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.readings_in_the_last_7_days;
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.readings_and_comments_20_days;
    `)

    return
  }
}

export class SanityReadingPositionRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads_sanity:reading_position'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads_sanity.reading_progress_last_6_months;
    `)

    return
  }
}

// Resolves candidate articles' discussion ids two ways, cheapest first:
//
// 1. Migrated (ex-Publikator) articles already have a `discussions` row keyed
//    by their old `repoId`, which hashes deterministically to the same
//    Sanity `_id` (see sanity/lib/legacyId.ts) -- so these are resolved
//    straight from Postgres, no Sanity round trip needed. This also sidesteps
//    a real gap: `discussion.backendDiscussionId` (see below) only gets set
//    when Studio calls back to /webhooks/sanity/discussions, which it never
//    does for already-migrated content, so relying on that alone leaves these
//    articles' discussion refs permanently unresolved.
// 2. Anything left over -- genuinely Sanity-native articles with no legacy
//    repoId -- falls back to the existing reverse-reference lookup
//    (sanity/lib/document.ts#fetchDiscussionRefsByIds), the only step in this
//    feature that talks to Sanity.
//
// Both are cached in next_reads_sanity.discussion_refs so the aggregate views
// below can join to `comments` in plain SQL; a short staleness window on new
// discussions is acceptable.
export class SanityNextReadsFeedRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads_sanity:feed:refresh'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    const rows: { sanityId: string }[] = await this.context.pgdb.query(`
      SELECT DISTINCT "sanityId" FROM next_reads_sanity.reading_progress_last_6_months;
    `)

    if (rows.length) {
      const candidateIds = new Set(rows.map((row) => row.sanityId))
      const resolved = new Map<string, string>()

      const legacyDiscussions: { id: string; repoId: string }[] =
        await this.context.pgdb.public.discussions.find(
          { 'repoId !=': null },
          { fields: ['id', 'repoId'] },
        )
      for (const discussion of legacyDiscussions) {
        const sanityId = legacySanityId(discussion.repoId)
        if (sanityId && candidateIds.has(sanityId)) {
          resolved.set(sanityId, discussion.id)
        }
      }

      const remainingIds = rows
        .map((row) => row.sanityId)
        .filter((sanityId) => !resolved.has(sanityId))

      const refs = await fetchDiscussionRefsByIds(remainingIds)
      for (const ref of refs) {
        if (ref.discussionId) {
          resolved.set(ref._id, ref.discussionId)
        }
      }

      if (resolved.size) {
        await this.context.pgdb.query(
          `
          INSERT INTO next_reads_sanity.discussion_refs ("sanityId", "discussionId", "updatedAt")
          SELECT s, d, now()
          FROM unnest(:sanityIds::text[], :discussionIds::uuid[]) AS t(s, d)
          ON CONFLICT ("sanityId") DO UPDATE SET
            "discussionId" = EXCLUDED."discussionId",
            "updatedAt" = now();
          `,
          {
            sanityIds: [...resolved.keys()],
            discussionIds: [...resolved.values()],
          },
        )
      }
    }

    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads_sanity.readings_in_the_last_7_days;
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads_sanity.readings_and_comments_20_days;
    `)

    return
  }
}
