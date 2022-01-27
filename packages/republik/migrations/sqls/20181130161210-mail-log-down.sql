DROP INDEX IF EXISTS "mail_log_type_idx";
DROP INDEX IF EXISTS "mail_log_user_id_idx";
DROP INDEX IF EXISTS "mail_log_email_lower_idx";
DROP INDEX IF EXISTS "mail_log_keys_idx";

DROP TABLE IF EXISTS "mailLog";

DROP DOMAIN mail_log_status;
