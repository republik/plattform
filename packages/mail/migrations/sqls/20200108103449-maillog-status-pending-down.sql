UPDATE "mailLog"
SET status = 'FAILED'
WHERE status = 'SCHEDULED'
;

ALTER DOMAIN mail_log_status
  DROP CONSTRAINT mail_log_status_check
;

ALTER DOMAIN mail_log_status
  ADD CONSTRAINT mail_log_status_check
  CHECK(
    VALUE IN ('SENDING', 'SENT', 'FAILED')
  )
;
