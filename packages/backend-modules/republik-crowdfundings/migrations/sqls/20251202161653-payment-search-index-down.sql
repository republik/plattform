-- migrate down here: DROP TABLE...
DROP INDEX IF EXISTS idx_payments_hrid_trgm;

-- 3. Create the index on pspId
DROP INDEX IF EXISTS idx_payments_pspid_trgm;
