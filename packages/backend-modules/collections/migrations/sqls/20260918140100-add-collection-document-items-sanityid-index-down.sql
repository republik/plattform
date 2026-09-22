-- Remove the index added in the paired -up.sql.
DROP INDEX CONCURRENTLY IF EXISTS "collectionDocumentItems_sanityId_idx";
