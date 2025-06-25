-- migrate up here: CREATE TABLE...
CREATE SCHEMA next_reads;

CREATE MATERIALIZED VIEW next_reads.reading_progress_last_6_months AS (
		SELECT
			id,
			"repoId",
			round(
				(
					CASE
						WHEN data -> 'max' -> 'data' ->> 'percentage' IS NOT NULL THEN data -> 'max' -> 'data' ->> 'percentage'
						ELSE data ->> 'percentage'
					END
				)::numeric * 100
			) "percentage",
			"createdAt"
		FROM
			"collectionDocumentItems" cdi
		WHERE
			"collectionId" IN (
				SELECT
					"id"
				FROM
					"collections"
				WHERE
					name = 'progress'
			)
			AND "createdAt" > now() - '6 months'::interval
		ORDER BY "createdAt" DESC
) WITH NO DATA;

CREATE UNIQUE INDEX next_reads_reading_progress_last_6_months_id ON next_reads.reading_progress_last_6_months(id);

CREATE MATERIALIZED VIEW next_reads.readings_in_the_last_7_days AS (
    SELECT
			p."repoId",
			COUNT(*) AS readings,
			COUNT(
				CASE
					WHEN p.percentage > 85 AND p."createdAt" > now() - '7 days'::interval THEN 1
				END
			) AS complete_readings,
			(r.meta ->> 'publishDate')::date AS publish_date,
			(CURRENT_DATE - (r.meta ->> 'publishDate')::date) AS days_since_publish
		FROM
			next_reads.reading_progress_last_6_months p
			JOIN publikator.repos r ON r.id = p."repoId"
		WHERE
			r."currentPhase" = 'published' AND
			p."createdAt" > now() - '7 days'::interval
		GROUP BY
			p."repoId",
			r.meta
) WITH NO DATA;

CREATE UNIQUE INDEX next_reads_readings_in_the_last_7_days ON next_reads.readings_in_the_last_7_days("repoId");
