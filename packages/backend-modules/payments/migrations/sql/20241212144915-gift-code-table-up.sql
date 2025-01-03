-- migrate up here: CREATE TABLE...
CREATE TABLE IF NOT EXISTS payments."giftVouchers" (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "code" text,
  "giftId" text,
  "issuedBy" payments.company NOT NULL,
  "redeemedBy" uuid,
  "redeemedForCompany" payments.company,
  "redeemedAt" timestamptz,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
