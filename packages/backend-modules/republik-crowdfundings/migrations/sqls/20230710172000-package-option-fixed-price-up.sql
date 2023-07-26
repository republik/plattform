ALTER TABLE "public"."packageOptions"
  ADD COLUMN "payMoreSuggestion" boolean
;

ALTER TABLE "public"."packageOptions"
  ADD COLUMN "fixedPrice" boolean
;

UPDATE "packageOptions" SET "fixedPrice" = false;

UPDATE "packageOptions" 
SET 
"fixedPrice" = true
WHERE "packageId" IN (
  SELECT id FROM packages
  WHERE name IN ('MONTHLY_ABO', 'YEARLY_ABO','LESHA'));
  
UPDATE "packageOptions" SET "payMoreSuggestion" = false;

UPDATE "packageOptions" 
SET 
"payMoreSuggestion" = true
WHERE "packageId" IN (
  SELECT id FROM packages
  WHERE name IN ('DONATE','ABO_GIVE','ABO_GIVE_MONTHS','YEARLY_ABO','LESHA'));
