ALTER TABLE "public"."packageOptions"
  ADD COLUMN "hiddenAt" timestamp with time zone,
  ADD COLUMN "disabledAt" timestamp with time zone;
