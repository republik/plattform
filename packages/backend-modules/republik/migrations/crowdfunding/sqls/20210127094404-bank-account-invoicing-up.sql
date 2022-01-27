ALTER TABLE "public"."bankAccounts"
  ADD COLUMN "image" bytea,
  ADD COLUMN "canInvoice" boolean NOT NULL DEFAULT false;
