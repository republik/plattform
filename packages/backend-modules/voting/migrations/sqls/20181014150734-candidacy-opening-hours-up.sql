ALTER TABLE "elections"
  ADD COLUMN "candidacyBeginDate"  timestamptz,
  ADD COLUMN "candidacyEndDate"    timestamptz
;

UPDATE "elections"
  SET
    "candidacyBeginDate" = "beginDate" - interval '1 month',
    "candidacyEndDate" = "beginDate" - interval '12 hour'
;

ALTER TABLE "elections"
  ALTER COLUMN "candidacyBeginDate" SET NOT NULL,
  ALTER COLUMN "candidacyEndDate" SET NOT NULL
;
