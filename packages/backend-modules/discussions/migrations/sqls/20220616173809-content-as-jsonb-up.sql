ALTER TABLE "public"."comments" ADD COLUMN "slatedAt" timestamp with time zone;
ALTER TABLE "public"."comments" RENAME COLUMN "content" TO "content__markdown";
ALTER INDEX public."comments_content_idx" RENAME TO "comments_content__markdown_idx";
ALTER TABLE "public"."comments" ADD COLUMN "content" jsonb DEFAULT '[]';
