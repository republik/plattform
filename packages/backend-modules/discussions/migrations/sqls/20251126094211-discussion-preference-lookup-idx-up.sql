-- migrate up here: CREATE TABLE...

CREATE INDEX IF NOT EXISTS idx_discussion_preference_lookup
ON "public"."discussionPreferences" (
  ("userId"::text || "discussionId"::text)
);
