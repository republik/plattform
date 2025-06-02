-- migrate up here: CREATE TABLE...
ALTER TABLE "public"."users" ADD COLUMN "birthyear" integer;

--run this separately
--UPDATE users SET "birthyear" = EXTRACT(YEAR FROM birthday)::int WHERE birthday IS NOT NULL;
--ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "birthday";

