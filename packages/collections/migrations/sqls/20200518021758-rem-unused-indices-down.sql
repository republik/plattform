CREATE INDEX IF NOT EXISTS "collection_document_items_collection_id_idx" ON "collectionDocumentItems"("collectionId");
CREATE INDEX IF NOT EXISTS "collection_document_items_repo_id_idx" ON "collectionDocumentItems"("repoId");
CREATE INDEX IF NOT EXISTS "collection_document_items_user_id_idx" ON "collectionDocumentItems"("userId");
