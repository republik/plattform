ALTER TABLE "public"."comments" DROP COLUMN "content";
ALTER TABLE "public"."comments" RENAME COLUMN "content__markdown" TO "content";
