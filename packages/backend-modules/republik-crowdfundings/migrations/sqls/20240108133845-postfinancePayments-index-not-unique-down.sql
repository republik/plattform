-- migrate down here: DROP TABLE...
DROP INDEX IF EXISTS "postfinancePayments_payment_key";
CREATE UNIQUE INDEX IF NOT EXISTS "postfinancePayments_buchungsdatum_valuta_avisierungstext_gu_key" ON "public"."postfinancePayments"("buchungsdatum","valuta","avisierungstext","gutschrift");
 