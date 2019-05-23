ALTER TABLE users
  ALTER COLUMN "testimonialId" DROP NOT NULL
;

ALTER TABLE users
  ALTER COLUMN "testimonialId" DROP DEFAULT
;

ALTER TABLE users
  DROP COLUMN "nameAccessRole"
;
