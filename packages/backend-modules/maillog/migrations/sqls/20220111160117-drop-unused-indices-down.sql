CREATE INDEX IF NOT EXISTS "mail_log_email_lower_idx" ON "mailLog"(lower("email")) ;
