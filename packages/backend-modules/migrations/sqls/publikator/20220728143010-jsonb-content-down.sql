ALTER TABLE "publikator"."commits"
  DROP COLUMN "content",
  DROP COLUMN "type";

DROP DOMAIN "publikatorCommitsType" ;

ALTER TABLE "publikator"."commits" RENAME COLUMN "content__markdown" TO "content";
