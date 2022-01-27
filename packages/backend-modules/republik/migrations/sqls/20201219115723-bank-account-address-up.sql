ALTER TABLE "bankAccounts"
  ADD COLUMN "addressId" uuid,
  ADD FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN "default" boolean NOT NULL DEFAULT 'FALSE';
