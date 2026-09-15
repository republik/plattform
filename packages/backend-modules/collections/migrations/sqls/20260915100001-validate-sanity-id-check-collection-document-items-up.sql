-- Validates the CHECK constraint added NOT VALID in
-- 20260915100000-add-sanity-id-to-collection-document-items-up.sql, as its
-- own migration so it runs in its own transaction: only this way does the
-- scan run under SHARE UPDATE EXCLUSIVE (allows concurrent reads/writes on
-- this heavily-written table) instead of inheriting the ACCESS EXCLUSIVE
-- lock the ADD CONSTRAINT statement held for that migration's transaction.
--
-- Safe to run against an environment where the constraint is already valid
-- (e.g. staging, which ran an earlier version of this constraint before it
-- was relaxed) -- VALIDATE CONSTRAINT is a no-op in that case.
ALTER TABLE "collectionDocumentItems"
  VALIDATE CONSTRAINT "collectionDocumentItems_one_document_ref";
