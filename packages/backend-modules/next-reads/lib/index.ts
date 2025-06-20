import { PgDb } from 'pogi'

export type NextReadsResult = {
  id: string
  documents: string[]
}

export type NextReadsResolverArgs = {
  repoId: string
  feeds: string[]
}

export type NextReadsResolverResult = { repoId: string; score: number }

export interface NextReadsFeedResolver {
  resolve: (exclude?: string[]) => Promise<NextReadsResolverResult[]>
}

export class PopularLast7DaysFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(exclude?: string[]): Promise<NextReadsResolverResult[]> {
    return this.pgdb.query(
      `
        SELECT
          "repoId",
          (readings + complete_readings * 3) as score
        FROM
          next_reads.readings_in_the_last_7_days
        WHERE
          "repoId" != ALL(:exclude)
        ORDER BY score DESC
        LIMIT 30;
      `,
      { exclude: exclude },
    )
  }
}

export class PopularLast20DaysCommentsFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(exclude?: string[]): Promise<NextReadsResolverResult[]> {
    return this.pgdb.query(
      `
      SELECT
        p."repoId",
        (
          (COUNT(p.id) + COUNT(
            CASE
              WHEN p.percentage > 85
              AND p."createdAt" > now() - '20 days'::interval THEN 1
            END) * 3)
          +
          (SELECT
              count(comments.id)
            FROM
              comments
            WHERE
              comments."discussionId" = d.id
              AND comments."createdAt" > now() - interval '20 days')
       	) AS score,
          (CURRENT_DATE - (r.meta ->> 'publishDate')::date) AS days_since_publish
        FROM
          next_reads.reading_progress_last_6_months p
          JOIN publikator.repos r ON r.id = p."repoId"
         	JOIN discussions d ON d."repoId" = p."repoId"
        WHERE
          p."repoId" != ALL(:exclude)
          AND p."repoId" not in (
            SELECT "repoId" FROM next_reads.readings_in_the_last_7_days
              WHERE "repoId" != ALL(:exclude)
              ORDER BY (readings + complete_readings * 3)
              DESC LIMIT 30
          )
          AND r."currentPhase" = 'published'
          AND (CURRENT_DATE - (r.meta ->> 'publishDate')::date) <= 20
        GROUP BY
         	p."repoId",
         	d.id,
         	r.meta
        ORDER BY score DESC
        LIMIT 30;
    `,
      { exclude: exclude },
    )
  }
}
