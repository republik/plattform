ALTER TABLE "discussions"
  ADD COLUMN "tags" jsonb,
  ADD COLUMN "tagRequired" boolean not null default false
;

ALTER TABLE "comments"
  ADD COLUMN "tags" jsonb
;

CREATE INDEX IF NOT EXISTS "discussions_tags_gin_idx" ON "discussions" USING gin ("tags");
CREATE INDEX IF NOT EXISTS "comments_tags_gin_idx" ON "comments" USING gin ("tags");
