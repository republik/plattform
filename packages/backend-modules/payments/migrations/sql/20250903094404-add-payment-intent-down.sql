-- migrate down here: DROP TABLE...
ALTER TABLE "payments"."charges" DROP COLUMN IF EXISTS "paymentIntentId";

ALTER TABLE "payments"."orders" DROP COLUMN IF EXISTS "paymentIntentId";

