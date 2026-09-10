-- migrate up here: CREATE TABLE...

-- Sanity-backed reading progress lives in "collectionDocumentItems"."sanityId"
-- (see collections' 20260729120000-add-sanity-id-to-collection-document-items),
-- not "repoId" -- the existing next_reads schema only ever selects "repoId",
-- so a Sanity article's progress rows are invisible to it. This is a
-- separate, Sanity-only mirror of that schema rather than a dual-mode
-- rewrite of it: it only needs to go live once every article has moved to
-- Sanity, at which point next_reads (Publikator) is deleted outright.
CREATE SCHEMA next_reads_sanity;

CREATE MATERIALIZED VIEW next_reads_sanity.reading_progress_last_6_months AS (
		SELECT
			id,
			"sanityId",
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
			"sanityId" IS NOT NULL
			AND "collectionId" IN (
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

CREATE UNIQUE INDEX next_reads_sanity_reading_progress_last_6_months_id ON next_reads_sanity.reading_progress_last_6_months(id);

-- The only piece of this feature that talks to Sanity: an article's
-- discussion is a *reverse* reference (a Sanity `discussion` document
-- carries `backendDiscussionId`, the Postgres discussions.id -- there is no
-- "sanityId" column on `discussions` to join against). A worker resolves and
-- caches this mapping periodically; readings/comments/score are all computed
-- live off it via ordinary SQL.
CREATE TABLE next_reads_sanity.discussion_refs (
	"sanityId" text PRIMARY KEY,
	"discussionId" uuid,
	"updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE MATERIALIZED VIEW next_reads_sanity.readings_in_the_last_7_days AS (
	SELECT
		p."sanityId",
		COUNT(*) AS readings,
		COUNT(
			CASE
				WHEN p.percentage > 85 AND p."createdAt" > now() - '7 days'::interval THEN 1
			END
		) AS complete_readings
	FROM
		next_reads_sanity.reading_progress_last_6_months p
	WHERE
		p."createdAt" > now() - '7 days'::interval
	GROUP BY
		p."sanityId"
) WITH NO DATA;

CREATE UNIQUE INDEX next_reads_sanity_readings_in_the_last_7_days ON next_reads_sanity.readings_in_the_last_7_days("sanityId");

CREATE MATERIALIZED VIEW next_reads_sanity.readings_and_comments_20_days AS (
	WITH comments_20_days AS (
			SELECT
				"discussionId",
				count(*) "comments",
				sum("upVotes") "upvotes",
				sum("downVotes") "downvotes"
			FROM
				comments
			WHERE
				"createdAt" > (now() - '20 days'::interval)
				AND "published" = TRUE
			GROUP BY
				"discussionId"
	)
			SELECT
				p."sanityId",
				count(*) AS readings,
				count(
					CASE WHEN p.percentage > 85::numeric
						AND p."createdAt" > (now() - '20 days'::interval) THEN
						1
					ELSE
						NULL::integer
					END) AS complete_readings,
				max(c.comments) "comments",
				max(c.upvotes) "upvotes",
				max(c.downvotes) "downvotes"
			FROM
				next_reads_sanity.reading_progress_last_6_months p
				JOIN next_reads_sanity.discussion_refs r ON r."sanityId" = p."sanityId"
				JOIN comments_20_days c ON c."discussionId" = r."discussionId"
			WHERE
				p."createdAt" > (now() - '20 days'::interval)
			GROUP BY
				p."sanityId"
) WITH NO DATA;

CREATE UNIQUE INDEX next_reads_sanity_readings_and_comments_20_days_id ON next_reads_sanity.readings_and_comments_20_days("sanityId");
