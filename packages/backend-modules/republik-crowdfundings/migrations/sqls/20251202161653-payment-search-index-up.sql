-- migrate up here: CREATE TABLE...
CREATE INDEX IF NOT EXISTS idx_payments_hrid_trgm 
ON payments USING gin (hrid gin_trgm_ops);

-- 3. Create the index on pspId
CREATE INDEX IF NOT EXISTS idx_payments_pspid_trgm 
ON payments USING gin ("pspId" gin_trgm_ops);

