CREATE TABLE "bankAccounts" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "companyId" uuid
    REFERENCES companies(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
  "iban" citext,
  "label" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updateAt" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("iban")
);

ALTER TABLE "postfinancePayments"
  ADD COLUMN "bankAccountId" uuid,
  ADD FOREIGN KEY ("bankAccountId")
    REFERENCES "public"."bankAccounts"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
