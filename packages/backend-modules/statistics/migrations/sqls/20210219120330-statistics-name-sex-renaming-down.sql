ALTER TABLE "statisticsNameSex" 
  RENAME TO "statisticsNameGender";

ALTER TABLE "statisticsNameGender" 
  RENAME COLUMN "sex" TO "gender";

ALTER INDEX IF EXISTS "statisticsNameSex_pkey" RENAME TO "statisticsNameGender_pkey";

DROP INDEX IF EXISTS "statistics_name_sex_firstname_sex_idx";
CREATE INDEX IF NOT EXISTS "statistics_name_gender_firstname_gender_idx" ON "statisticsNameGender" ("firstName", "gender");
