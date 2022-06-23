ALTER TABLE "public"."comments" DROP COLUMN "content";
ALTER TABLE "public"."comments" RENAME COLUMN "content__markdown" TO "content";
ALTER INDEX public."comments_content__markdown_idx" RENAME TO "comments_content_idx";
ALTER TABLE "public"."comments" DROP COLUMN "slatedAt";
