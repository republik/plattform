-- migrate up here: CREATE TABLE...
ALTER TABLE "payments"."charges"
  ADD COLUMN "customerId" text,
  ADD COLUMN "description" text,
  ADD COLUMN "failureCode" text,
  ADD COLUMN "failureMessage" text;
