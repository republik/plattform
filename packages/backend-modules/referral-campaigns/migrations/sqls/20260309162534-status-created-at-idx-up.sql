CREATE INDEX IF NOT EXISTS pledges_status_created_at_idx ON pledges (status, "createdAt");
CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON payments.orders (status, "createdAt");
