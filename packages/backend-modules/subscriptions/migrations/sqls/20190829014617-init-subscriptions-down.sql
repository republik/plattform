DROP TRIGGER check_subscription ON subscriptions;
DROP FUNCTION check_subscription_trg;

DROP INDEX IF EXISTS "subscription_user_id";
DROP INDEX IF EXISTS "subscription_filters";
DROP INDEX IF EXISTS "subscription_object_type";
DROP INDEX IF EXISTS "subscription_object_user_id";
DROP INDEX IF EXISTS "subscription_object_document_id";
DROP INDEX IF EXISTS "subscription_object_discussion_id";

DROP TABLE subscriptions;
DROP DOMAIN subscription_object_type;
