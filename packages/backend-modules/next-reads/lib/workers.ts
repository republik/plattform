import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { fetchDiscussionRefsByIds } from '@orbiting/backend-modules-sanity'

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

// The only step in this feature that talks to Sanity: resolving each
// candidate article's discussion id (a reverse reference stored on the
// Sanity document, not a Postgres column -- see
// sanity/lib/document.ts#fetchDiscussionRefsByIds). Cached in
// next_reads_sanity.discussion_refs so the aggregate views below can join to
// `comments` in plain SQL; a short staleness window on new discussions is
// acceptable.
export class SanityNextReadsFeedRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads_sanity:feed:refresh'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    const rows: { sanityId: string }[] = await this.context.pgdb.query(`
      SELECT DISTINCT "sanityId" FROM next_reads_sanity.reading_progress_last_6_months;
    `)

    if (rows.length) {
      const refs = await fetchDiscussionRefsByIds(rows.map((row) => row.sanityId))
      const resolved = refs.filter(
        (ref): ref is { _id: string; discussionId: string } => !!ref.discussionId,
      )

      if (resolved.length) {
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
            sanityIds: resolved.map((ref) => ref._id),
            discussionIds: resolved.map((ref) => ref.discussionId),
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
