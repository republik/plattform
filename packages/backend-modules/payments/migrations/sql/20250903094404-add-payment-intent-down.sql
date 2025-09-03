-- migrate down here: DROP TABLE...
ALTER TABLE "payments"."charges" DROP COLUMN IF EXISTS "externalPaymentIntent";

ALTER TABLE "payments"."orders" DROP COLUMN IF EXISTS "externalPaymentIntent";

