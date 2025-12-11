-- migrate up here: CREATE TABLE...

CREATE INDEX IF NOT EXISTS discussion_preferences_lookup_idx
ON "public"."discussionPreferences" (
  ("userId"::text || ':' || "discussionId"::text)
);
