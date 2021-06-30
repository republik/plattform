ALTER TABLE "statisticsMatomo"
  DROP CONSTRAINT "statisticsMatomo_repoId_fkey";

ALTER TABLE "collectionDocumentItems"
  DROP CONSTRAINT "collectionDocumentItems_repoId_fkey";

ALTER TABLE discussions
  DROP CONSTRAINT "discussions_repoId_fkey";

