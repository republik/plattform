-- Validates the CHECK constraint added NOT VALID in
-- 20260729120000-add-sanity-id-to-collection-document-items-up.sql, as its
-- own migration so it runs in its own transaction: only this way does the
-- scan run under SHARE UPDATE EXCLUSIVE (allows concurrent reads/writes on
-- this heavily-written table) instead of inheriting the ACCESS EXCLUSIVE
-- lock the ADD CONSTRAINT statement held for that migration's transaction.
ALTER TABLE "collectionDocumentItems"
  VALIDATE CONSTRAINT "collectionDocumentItems_one_document_ref";
