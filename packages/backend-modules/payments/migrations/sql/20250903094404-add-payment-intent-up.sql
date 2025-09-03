-- migrate up here: CREATE TABLE...
ALTER TABLE "payments"."charges"
  ADD COLUMN "externalPaymentIntent" text;

ALTER TABLE "payments"."orders"
  ADD COLUMN "externalPaymentIntent" text;

