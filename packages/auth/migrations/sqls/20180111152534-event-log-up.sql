CREATE TABLE "eventLog" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "schemaName"  text NOT NULL,
  "tableName"   text NOT NULL,
  "query"       text NOT NULL,
  "action"			text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  "oldData"     jsonb,
  "newData"     jsonb,
  "userId"      uuid references "users",
  "createdAt"   timestamptz default now()
);

CREATE OR REPLACE FUNCTION is_valid_uuid(text) RETURNS BOOLEAN immutable AS $$
BEGIN
  RETURN CASE WHEN uuid($1) IS NULL THEN FALSE ELSE TRUE END;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END
$$ LANGUAGE 'plpgsql';

-- the userId extraction only works for the sessions table yet
-- https://wiki.postgresql.org/wiki/Audit_trigger
CREATE OR REPLACE FUNCTION log_auth() RETURNS trigger AS $$
DECLARE
   _user_id_raw text;
   _user_id uuid;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    _user_id_raw := NEW.sess #>> '{passport, user}';
  ELSE
    _user_id_raw := OLD.sess #>> '{passport, user}';
  END IF;
  IF (is_valid_uuid(_user_id_raw)) THEN
    _user_id := uuid(_user_id_raw);
  END IF;
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO "eventLog" ("schemaName", "tableName", "query", "action", "oldData", "newData", "userId")
    VALUES (
      TG_TABLE_SCHEMA::TEXT,
      TG_TABLE_NAME::TEXT,
      current_query(),
      TG_OP::TEXT,
      to_json(OLD.*),
      to_json(NEW.*),
      _user_id
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO "eventLog" ("schemaName", "tableName", "query", "action", "oldData", "newData", "userId")
    VALUES (
      TG_TABLE_SCHEMA::TEXT,
      TG_TABLE_NAME::TEXT,
      current_query(),
      TG_OP::TEXT,
      to_json(OLD.*),
      null,
      _user_id
    );
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO "eventLog" ("schemaName", "tableName", "query", "action", "oldData", "newData", "userId")
    VALUES (
      TG_TABLE_SCHEMA::TEXT,
      TG_TABLE_NAME::TEXT,
      current_query(),
      TG_OP::TEXT,
      null,
      to_json(NEW.*),
      _user_id
    );
    RETURN NEW;
  END IF;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_sessions
  BEFORE INSERT OR DELETE ON sessions
  FOR EACH ROW
  EXECUTE PROCEDURE log_auth();

-- ignoring expire only updates
CREATE TRIGGER trigger_sessions_updates
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  WHEN (
    NEW.sid IS DISTINCT FROM OLD.sid OR
    NEW.sess IS DISTINCT FROM OLD.sess
  )
  EXECUTE PROCEDURE log_auth();
