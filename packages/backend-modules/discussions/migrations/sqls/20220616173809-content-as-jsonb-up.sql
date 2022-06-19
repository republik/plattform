ALTER TABLE "public"."comments" ADD COLUMN "slatedAt" timestamp with time zone;
ALTER TABLE "public"."comments" RENAME COLUMN "content" TO "content__markdown";
ALTER TABLE "public"."comments" ADD COLUMN "content" jsonb DEFAULT '[]';
