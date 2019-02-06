ALTER DOMAIN cancel_category DROP CONSTRAINT cancel_category_check;

ALTER DOMAIN cancel_category ADD CONSTRAINT cancel_category_check
  CHECK(
    VALUE IN (
      'EDITORIAL',
      'EDITORAL_NARCISSISTIC',
      'NO_TIME',
      'TOO_EXPENSIVE',
      'NO_MONEY',
      'LOGIN_TECH',
      'PAPER',
      'EXPECTIONS',
      'RARELY_READ',
      'TOO_MUCH_TO_READ',
      'CROWFUNDING_ONLY',
      'SEVERAL_REASONS',
      'OTHER',
      'VOID',
      'SYSTEM'
    )
  );

ALTER TABLE "membershipCancellations"
  ADD COLUMN "suppressConfirmation" boolean not null default false,
  ADD COLUMN "suppressWinback" boolean not null default false,
  ADD COLUMN "cancelledViaSupport" boolean not null default false
;

UPDATE "membershipCancellations" SET
  "suppressConfirmation" = "suppressNotifications",
  "suppressWinback" = "suppressNotifications"
;

ALTER TABLE "membershipCancellations"
  DROP COLUMN "suppressNotifications"
;
