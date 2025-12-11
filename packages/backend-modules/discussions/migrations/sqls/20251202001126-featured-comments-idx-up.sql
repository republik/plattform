CREATE INDEX IF NOT EXISTS comments_featured_targets_default_idx
ON comments ("discussionId")
WHERE
  'DEFAULT' = ANY("featuredTargets") AND
  published = TRUE AND "adminUnpublished" = FALSE;

CREATE INDEX IF NOT EXISTS comments_featured_targets_marketing_idx
ON comments ("discussionId")
WHERE
  'MARKETING' = ANY("featuredTargets") AND
  published = TRUE AND "adminUnpublished" = FALSE;
