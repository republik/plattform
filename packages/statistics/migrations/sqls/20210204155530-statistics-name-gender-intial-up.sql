CREATE TABLE "statisticsNameGender" (
  "firstName" citext PRIMARY KEY,
  "femaleCount" integer,
  "maleCount" integer,
  "gender" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "statistics_name_gender_firstname_gender_idx" ON "statisticsNameGender" ("firstName", "gender");
