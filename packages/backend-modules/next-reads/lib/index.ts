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
		r."repoId",
		(r.readings + r.complete_readings * 3) + r.comments AS score,
		r.days_since_publish
	FROM
		next_reads.readings_and_comments_20_days r
	WHERE
		r."repoId" != ALL(:exclude)
		AND r."repoId" NOT IN (
			SELECT
				"repoId"
			FROM
				next_reads.readings_in_the_last_7_days
			ORDER BY
				(readings + complete_readings * 3) DESC
			LIMIT 30)
	AND r.days_since_publish <= 20
ORDER BY
	score DESC
LIMIT 30;
    `,
      { exclude: exclude },
    )
  }
}

// Sanity-only counterparts. Publish state and recency can't be computed in
// SQL for Sanity content (no row in publikator.repos), so these feeds only
// return raw `sanityId`/`score` pairs -- the caller (nextReadsSanity
// resolver) fetches each candidate from Sanity to filter by kind/publish
// date/recency before returning results. See next_reads_sanity's views:
// discussion links are resolved and cached by a worker (the only Sanity
// round trip in this feature), everything else is a live SQL join/aggregate.
export type SanityNextReadsResolverResult = { sanityId: string; score: number }

export interface SanityNextReadsFeedResolver {
  resolve: (exclude?: string[]) => Promise<SanityNextReadsResolverResult[]>
}

export class SanityPopularLast7DaysFeed implements SanityNextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(exclude?: string[]): Promise<SanityNextReadsResolverResult[]> {
    return this.pgdb.query(
      `
        SELECT
          "sanityId",
          (readings + complete_readings * 3) as score
        FROM
          next_reads_sanity.readings_in_the_last_7_days
        WHERE
          "sanityId" != ALL(:exclude)
        ORDER BY score DESC
        LIMIT 30;
      `,
      { exclude: exclude },
    )
  }
}

export class SanityPopularLast20DaysCommentsFeed
  implements SanityNextReadsFeedResolver
{
  constructor(private pgdb: PgDb) {}

  async resolve(exclude?: string[]): Promise<SanityNextReadsResolverResult[]> {
    return this.pgdb.query(
      `
      SELECT
		r."sanityId",
		(r.readings + r.complete_readings * 3) + r.comments AS score
	FROM
		next_reads_sanity.readings_and_comments_20_days r
	WHERE
		r."sanityId" != ALL(:exclude)
		AND r."sanityId" NOT IN (
			SELECT
				"sanityId"
			FROM
				next_reads_sanity.readings_in_the_last_7_days
			ORDER BY
				(readings + complete_readings * 3) DESC
			LIMIT 30)
ORDER BY
	score DESC
LIMIT 30;
    `,
      { exclude: exclude },
    )
  }
}

export type SanityNextReadsResolverArgs = {
  documentId: string
}
