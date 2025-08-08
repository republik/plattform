-- migrate up here: CREATE TABLE...

CREATE MATERIALIZED VIEW documents as (
    SELECT
      m.id,
      m."repoId" AS repo_id,
      m."commitId" AS commit_id,
      m.name AS version_name,
      commit_meta.title AS title,
      commit_meta."shortTitle" AS short_title,
      commit_meta."shareText" AS share_text,
      commit_meta."seoDescription" as seo_description,
      commit_meta.image AS cover_image,
      commit_meta.slug,
      CASE
        WHEN commit_meta.template IN ('article', 'editorialNewsletter') THEN
          concat('/', to_char(repo_meta."publishDate", 'YYYY/MM/DD'), '/', commit_meta.slug)
        WHEN commit_meta.template = 'discussion' THEN
          concat('/', to_char(repo_meta."publishDate", 'YYYY/MM/DD'), '/', commit_meta.slug, '/diskussion')
        WHEN commit_meta.template = 'format' THEN
          concat('/format/', commit_meta.slug)
        WHEN commit_meta.template = 'dossier' THEN
          concat('/dossier/', commit_meta.slug)
        ELSE
          concat('/', commit_meta.slug)
      END AS PATH,
      regexp_replace(commit_meta.format, '^https://github\.com/', '') AS FORMAT,
      regexp_replace(commit_meta.series, '^https://github\.com/', '') AS series,
      repo_meta."isTemplate" as is_template,
      repo_meta."publishDate" as publish_date,
      repo_meta."mailchimpCampaignId" as mailchimp_campaign_id,
      milestone_meta."updateMailchimp" as update_mailchimp,
      milestone_meta."notifyFilters" as notify_filters,
      c.meta AS commit_meta,
      r.meta AS repo_meta,
      m.meta AS milestone_meta,
      COALESCE(commit_meta.feed, FALSE) AS feed,
      commit_meta.template,
      ARRAY(
        SELECT
          regexp_replace(element, '^https://github\.com/', '')
        FROM
          unnest(commit_meta.recommendations) AS element
      ) AS recommendations,
      m.scope as document_state,
      m."scheduledAt",
      m."publishedAt"
    FROM
      publikator.milestones m
      JOIN publikator.repos r ON m."repoId" = r.id
      JOIN publikator.commits c ON m."commitId" = c.id
      CROSS JOIN LATERAL jsonb_to_record(m.meta) AS milestone_meta (
        "updateMailchimp" boolean,
        "notifyFilters" TEXT[]
      )
      CROSS JOIN LATERAL jsonb_to_record(r.meta) AS repo_meta (
        "publishDate" DATE,
        "isTemplate" boolean,
        "mailchimpCampaignId" TEXT
      )
      CROSS JOIN LATERAL jsonb_to_record(c.meta) AS commit_meta (
        "title" TEXT,
        "shortTitle" TEXT,
        "shareText" TEXT,
        "seoDescription" TEXT,
        "templateRepoId" TEXT,
        "image" text,
        "format" text,
        "series" text,
        "feed" boolean,
        "slug" text,
        "template" TEXT,
        "newsletter" jsonb,
        "paynotes" jsonb,
        "recommendations" TEXT[],
        "willBeReadAloud" BOOLEAN,
        "suppressSyntheticReadAloud" BOOLEAN
      )
    WHERE
      (scope = 'publication' OR scope = 'prepublication')
      AND "revokedAt" IS NULL
    ORDER BY
      repo_meta."publishDate"
) WITH NO DATA;

CREATE UNIQUE INDEX documents_id_idx ON documents (id);
CREATE INDEX documents_state_idx on documents (document_state);
CREATE INDEX documents_publish_date_desc_idx on documents  (publish_date DESC);
CREATE INDEX documents_path_idx on documents (path text_pattern_ops);
