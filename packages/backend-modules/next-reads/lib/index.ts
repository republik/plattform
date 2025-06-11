import { PgDb } from 'pogi'

export type NextReadsResult = {
  id: string
  documents: string[]
}

export type NextReadsResolverArgs = {
  repoId: string
  feeds: string[]
}

interface NextReadsFeedResolver {
  resolve: () => Promise<string[]>
}

export class PopularLast7DaysFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(): Promise<string[]> {
    return this.pgdb.query(
      `
      WITH
	positions AS (
		SELECT
			"repoId",
			round(
				(
					CASE
						WHEN data -> 'max' -> 'data' ->> 'percentage' IS NOT NULL THEN data -> 'max' -> 'data' ->> 'percentage'
						ELSE data ->> 'percentage'
					END
				)::numeric * 100
			) "percentage",
			cdi."createdAt"
		FROM
			"collectionDocumentItems" cdi
			INNER JOIN "users" u ON u.id = cdi."userId"
		WHERE
			"collectionId" IN (
				SELECT
					"id"
				FROM
					"collections"
				WHERE
					name = 'progress'
			)
			AND cdi."createdAt" > now() - '3 months'::interval
		ORDER BY
			cdi."createdAt" DESC
	),
	repo_stats AS (
		SELECT
			p."repoId",
			PERCENTILE_CONT(0.5) WITHIN GROUP (
				ORDER BY
					p.percentage
			) AS percentile_50_reading_position,
			PERCENTILE_CONT(0.75) WITHIN GROUP (
				ORDER BY
					p.percentage
			) AS percentile_75_reading_position,
			PERCENTILE_CONT(0.9) WITHIN GROUP (
				ORDER BY
					p.percentage
			) AS percentile_90_reading_position,
  			AVG(p.percentage) AS avg_reading_position,
  			MIN(p.percentage) AS min_reading_position,
  			MAX(p.percentage) AS max_reading_position,
			COUNT(*) AS total_readings_in_last_3_months,
			COUNT(
				CASE
					WHEN p.percentage > 85 THEN 1
				END
			) AS complete_readings_in_last_3_months,
			-- Count readings in last 7 days specifically
			COUNT(
				CASE
					WHEN p."createdAt" > now() - '7 days'::interval THEN 1
				END
			) AS readings_last_7_days,
			COUNT(
				CASE
					WHEN p.percentage > 85 AND p."createdAt" > now() - '7 days'::interval THEN 1
				END
			) AS complete_readings_last_7_days,
			c.meta ->> 'title' AS "article_title",
			(r.meta ->> 'publishDate')::date AS publish_date
		FROM
			positions p
			JOIN publikator.repos r ON r.id = p."repoId"
			JOIN publikator.milestones m ON m."repoId" = r.id
			AND m."publishedAt" IS NOT NULL
			AND m."revokedAt" IS NULL
			AND m.scope = 'publication'
			JOIN publikator.commits c ON c.id = m."commitId"
		GROUP BY
			p."repoId",
			r.meta,
			c.meta
	),
	popular AS (
		SELECT
			"repoId",
			article_title,
			publish_date,
			percentile_50_reading_position,
			percentile_75_reading_position,
			percentile_90_reading_position,
			avg_reading_position,
			min_reading_position,
			max_reading_position,
			total_readings_in_last_3_months,
			complete_readings_in_last_3_months,
			readings_last_7_days,
			complete_readings_last_7_days,
			-- Popularity score based heavily on recent activity
			(readings_last_7_days + complete_readings_last_7_days * 3) AS popularity_score_7_days,
			(total_readings_in_last_3_months + complete_readings_in_last_3_months * 3) AS popularity_score_3_months,
			-- Age-adjusted scoring system (still useful for tie-breaking)
			(CURRENT_DATE - publish_date) AS days_since_publish
		FROM
			repo_stats
	)
      SELECT
        "repoId",
       	readings_last_7_days as total_reading,
       	complete_readings_last_7_days as completed_readings,
       	popularity_score_7_days as popularity_score
      FROM
        popular
      WHERE
        "repoId" NOT IN (:exclude)
      ORDER BY
	popularity_score DESC
      LIMIT 30;
      `,
      { exclude: [] },
    )
  }
}

export class PopularLast20DaysCommentsFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(): Promise<string[]> {
    throw new Error('Not implemented')
  }
}
