ALTER TABLE "comments"
  ADD COLUMN "urls" jsonb,
  ADD COLUMN "embedUrl" citext,
  ADD COLUMN "mentioningRepoId" text,
  ADD COLUMN "mentioningFragmentId" text
;
ALTER TABLE "comments"
  RENAME COLUMN "reportedBy" TO "reports"
;

ALTER TABLE "discussions"
  ADD COLUMN "isBoard" boolean NOT NULL default false
;

CREATE INDEX "comments_urls_idx" ON comments USING gin ("urls");
CREATE INDEX "comments_embedUrl_idx" ON comments("embedUrl");
CREATE INDEX "comments_mentioningRepoId_idx" ON comments("embedUrl");
CREATE INDEX "comments_mentioningFragmentId_idx" ON comments("mentioningFragmentId");
