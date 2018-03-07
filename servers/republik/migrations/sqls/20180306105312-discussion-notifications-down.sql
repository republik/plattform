DROP TABLE IF EXISTS "notifications";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "defaultDiscussionNotificationOption",
  DROP COLUMN IF EXISTS "discussionNotificationChannels"
;

ALTER TABLE "discussionPreferences"
  DROP COLUMN IF EXISTS "notificationOption"
;

DROP TYPE IF EXISTS "discussionNotificationOption";
