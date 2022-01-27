ALTER TABLE users
  ALTER COLUMN "testimonialId" SET DEFAULT uuid_generate_v4()
;

UPDATE users SET "testimonialId" = uuid_generate_v4() WHERE "testimonialId" IS NULL;

ALTER TABLE users
  ALTER COLUMN "testimonialId" SET NOT NULL
;
