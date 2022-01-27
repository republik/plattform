DROP TRIGGER IF EXISTS trigger_users_notify_change
  ON users;
DROP TRIGGER IF EXISTS trigger_credentials_notify_change
  ON credentials;
DROP TRIGGER IF EXISTS trigger_comments_notify_change
  ON comments;
DROP TRIGGER IF EXISTS trigger_discussions_notify_change
  ON discussions;
DROP TRIGGER IF EXISTS trigger_discussionPreferences_notify_change
  ON "discussionPreferences";

DROP FUNCTION IF EXISTS notify_table_change;

DROP TABLE IF EXISTS "notifyTableChangeQueue";
