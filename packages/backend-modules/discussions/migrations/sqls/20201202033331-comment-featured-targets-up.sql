ALTER TABLE "public"."comments" ADD COLUMN "featuredTargets" text[];
UPDATE "public"."comments" SET "featuredTargets" = '{DEFAULT}' WHERE "featuredAt" IS NOT NULL;
