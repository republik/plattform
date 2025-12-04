-- migrate up here: CREATE TABLE...
ALTER TABLE "payments"."charges"
  ADD COLUMN "paymentIntentId" text;

ALTER TABLE "payments"."orders"
  ADD COLUMN "paymentIntentId" text;

