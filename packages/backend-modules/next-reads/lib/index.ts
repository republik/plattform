import { PgDb } from 'pogi'

export type NextReadsResult = {
  id: string
  documents: string[]
}

export type NextReadsResolverArgs = {
  repoId: string
  feeds: string[]
}

export const KNOWN_FEEDS = {
  POPULAR_LAST_7_DAYS: '7_days',
  POPULAR_LAST_20_DAYS_COMMENTS: '20_days',
}

export async function getFeed(
  pgdb: PgDb,
  feed: 'POPULAR_LAST_7_DAYS' | 'POPULAR_LAST_20_DAYS_COMMENTS',
) {
  return pgdb.public.query(
    // TODO use Materialized view for this
    `
    WITH
	positions AS (
		SELECT
			u.email,
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
			COUNT(*) AS total_readings,
			COUNT(
				CASE
					WHEN p.percentage > 85 THEN 1
				END
			) AS complete_readings,
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
		HAVING
			COUNT(*) >= 50 -- Only include repos with at least 50 readings
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
			total_readings,
			complete_readings,
			ROUND((complete_readings::numeric / total_readings::numeric) * 100, 1) AS completion_rate_percent,
			-- Age-adjusted scoring system
			(CURRENT_DATE - publish_date) AS days_since_publish,
			(total_readings + complete_readings * 3) AS base_score,
			ROUND(
				(total_readings + complete_readings * 3) * CASE
					WHEN (CURRENT_DATE - publish_date) <= 7 THEN 1.0
					WHEN (CURRENT_DATE - publish_date) <= 30 THEN 0.9
					WHEN (CURRENT_DATE - publish_date) <= 90 THEN 0.7
					WHEN (CURRENT_DATE - publish_date) <= 180 THEN 0.5
					WHEN (CURRENT_DATE - publish_date) <= 365 THEN 0.3
					ELSE 0.1
				END,
				2
			) AS age_adjusted_score,
			-- Period classification for non-overlapping results
			CASE
				WHEN (
					SELECT
						COUNT(*)
					FROM
						positions p_recent
					WHERE
						p_recent."repoId" = repo_stats."repoId"
						AND p_recent."createdAt" > now() - '7 days'::interval
				) > total_readings / 2 THEN '7_days'
				WHEN (
					SELECT
						COUNT(*)
					FROM
						positions p_medium
					WHERE
						p_medium."repoId" = repo_stats."repoId"
						AND p_medium."createdAt" > now() - '20 days'::interval
						AND p_medium."createdAt" <= now() - '7 days'::interval
				) > total_readings / 2 THEN '20_days'
				ELSE 'older'
			END AS trending_period
		FROM
			repo_stats
	)
    SELECT
    "repoId"
    FROM
	popular
    WHERE
	trending_period = :feed
    ORDER BY base_score DESC
    LIMIT
	20;
  `,
    { feed: KNOWN_FEEDS[feed] },
  )
}
