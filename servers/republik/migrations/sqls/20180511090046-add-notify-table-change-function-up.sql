-- This migration creates a queue table, a function which writes into that
-- queue table and notifies on channel "change" about calling it. It also
-- creates triggers on multiple tables (INSERT, UPDATE, DELETE) which execute
-- that function.
CREATE TABLE "notifyTableChangeQueue" (
  "table" text NOT NULL,
  op text NOT NULL,
  id uuid NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- Ensure only a single pair of id/op is present in queue table.
CREATE UNIQUE INDEX "notifyTableChangeQueue_id_op_idx"
  ON "notifyTableChangeQueue" USING btree (id, op);

-- Function to write a table change into queue and notify channel "change"
CREATE OR REPLACE FUNCTION notify_table_change()
RETURNS trigger AS $$
DECLARE
   _record RECORD;
   _payload text;
BEGIN
  CASE TG_OP
  WHEN 'INSERT', 'UPDATE' THEN
    _record := NEW;
  WHEN 'DELETE' THEN
    _record := OLD;
  ELSE
    RAISE EXCEPTION 'Unknown TG_OP: "%". Should not occur!', TG_OP;
  END CASE;

  -- Insert a record in dedicated "queue" table
  INSERT INTO "notifyTableChangeQueue" ("table", op, id)
  VALUES (TG_TABLE_NAME, TG_OP, _record.id)
  ON CONFLICT (id, op) DO UPDATE SET
    "createdAt" = now();

  -- Build JSON payload, then submit via pg_notify
  _payload := json_build_object(
    'table', TG_TABLE_NAME,
    'op', TG_OP
  )::text;

  PERFORM pg_notify('change', _payload);

  RETURN _record;
END
$$ LANGUAGE 'plpgsql';

-- notify_table_change() executed on INSERT, UPDATE, CHANGE of "users"
CREATE TRIGGER trigger_users_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();

  -- notify_table_change() executed on INSERT, UPDATE, CHANGE of "credentials"
CREATE TRIGGER trigger_credentials_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON credentials
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();

-- notify_table_change() executed on INSERT, UPDATE, CHANGE of "comments"
CREATE TRIGGER trigger_comments_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();
