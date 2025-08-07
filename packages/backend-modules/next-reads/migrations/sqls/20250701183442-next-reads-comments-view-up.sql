-- migrate up here: CREATE TABLE...
CREATE MATERIALIZED VIEW next_reads.readings_and_comments_20_days AS (
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
			p."repoId",
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
			max(c.downvotes) "downvotes",
			(r.meta ->> 'publishDate'::text)::date AS publish_date,
			CURRENT_DATE - ((r.meta ->> 'publishDate'::text)::date) AS days_since_publish
		FROM
			next_reads.reading_progress_last_6_months p
			JOIN publikator.repos r ON r.id = p."repoId"
			JOIN discussions d ON d."repoId" = p."repoId"
			JOIN comments_20_days c ON c."discussionId" = d.id
		WHERE
			r."currentPhase" = 'published'::text
			AND p."createdAt" > (now() - '20 days'::interval)
		GROUP BY
			p."repoId",
			r.meta

) WITH NO DATA;

CREATE UNIQUE INDEX next_reads_readings_and_comments_20_days_id ON next_reads.readings_and_comments_20_days("repoId");
