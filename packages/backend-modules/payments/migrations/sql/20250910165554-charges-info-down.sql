-- migrate down here: DROP TABLE...
ALTER TABLE "payments"."charges"
  DROP COLUMN IF EXISTS "customerId",
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "failureCode",
  DROP COLUMN IF EXISTS "failureMessage";
