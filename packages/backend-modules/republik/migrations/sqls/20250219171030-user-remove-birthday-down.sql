-- migrate down here: DROP TABLE...
ALTER TABLE "public"."users"
  ADD COLUMN "birthday" date 
;
