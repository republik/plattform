ALTER TABLE "statisticsNameGender" 
  RENAME TO "statisticsNameSex";

ALTER TABLE "statisticsNameSex" 
  RENAME COLUMN "gender" TO "sex";

ALTER INDEX IF EXISTS "statisticsNameGender_pkey" RENAME TO "statisticsNameSex_pkey";

DROP INDEX IF EXISTS "statistics_name_gender_firstname_gender_idx";
CREATE INDEX IF NOT EXISTS "statistics_name_sex_firstname_sex_idx" ON "statisticsNameSex" ("firstName", "sex");
