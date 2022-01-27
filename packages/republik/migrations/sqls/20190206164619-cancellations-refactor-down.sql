ALTER DOMAIN cancel_category DROP CONSTRAINT cancel_category_check

ALTER DOMAIN cancel_category ADD CONSTRAINT cancel_category_check
  CHECK(
    VALUE IN ('EDITORIAL', 'NO_TIME', 'TOO_EXPENSIVE', 'OTHER', 'VOID', 'SYSTEM')
  );

ALTER TABLE "membershipCancellations"
  ADD COLUMN "suppressNotifications"
;

UPDATE "membershipCancellations" SET
  "suppressNotifications" = "suppressConfirmation"
;

ALTER TABLE "membershipCancellations"
  DROP COLUMN "suppressConfirmation" boolean not null default false,
  DROP COLUMN "suppressWinback" boolean not null default false,
  DROP COLUMN "cancelledViaSupport" boolean not null default false
;


