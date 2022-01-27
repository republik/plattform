CREATE TYPE "discussionNotificationOption" AS ENUM (
  'MY_CHILDREN',
  'ALL',
  'NONE'
);

-- set default value for existing tuples on migration
ALTER TABLE "discussionPreferences"
  ADD COLUMN "notificationOption"                          "discussionNotificationOption" NOT NULL DEFAULT 'MY_CHILDREN'
;
-- we actually don't want a default value
ALTER TABLE "discussionPreferences"
  ALTER COLUMN "notificationOption" DROP DEFAULT
;

ALTER TABLE "users"
  ADD COLUMN "defaultDiscussionNotificationOption"         "discussionNotificationOption" NOT NULL DEFAULT 'MY_CHILDREN',
  ADD COLUMN "discussionNotificationChannels"              jsonb NOT NULL DEFAULT '["WEB", "EMAIL"]'
;
