-- migrate up here: CREATE TABLE...
ALTER TABLE "public"."users" ADD COLUMN "birthyear" integer;

UPDATE users SET "birthyear" = EXTRACT(YEAR FROM birthday)::int WHERE birthday IS NOT NULL;

