ALTER TABLE "public"."packageOptions"
  ADD COLUMN "payMoreSuggestion" boolean NOT NULL DEFAULT TRUE
;

ALTER TABLE "public"."packageOptions"
  ADD COLUMN "fixedPrice" boolean NOT NULL DEFAULT FALSE
;

UPDATE "packageOptions" 
SET 
"fixedPrice" = true
WHERE "packageId" IN (
  SELECT id FROM packages
  WHERE name IN ('MONTHLY_ABO', 'YEARLY_ABO','LESHA'));

UPDATE "packageOptions" 
SET 
"payMoreSuggestion" = FALSE
WHERE "packageId" IN (
  SELECT id FROM packages
  WHERE name IN ('DONATE','ABO_GIVE','ABO_GIVE_MONTHS','YEARLY_ABO','LESHA'));
