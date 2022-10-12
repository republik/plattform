ALTER TABLE "publikator"."commits" RENAME COLUMN "content" TO "content__markdown";

CREATE DOMAIN "publikatorCommitsType" AS TEXT
  CONSTRAINT "publikatorCommitsTypeCheck"
    CHECK(
      VALUE IN (null, 'mdast', 'slate')
    );
  
ALTER TABLE "publikator"."commits"
  ADD COLUMN "content" jsonb,
  ADD COLUMN "type" text ;
