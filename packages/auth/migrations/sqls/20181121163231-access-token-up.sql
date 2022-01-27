CREATE EXTENSION pgcrypto;

ALTER TABLE "users"
  ADD COLUMN "accessKey" uuid NOT NULL DEFAULT gen_random_uuid()
;

CREATE OR REPLACE FUNCTION roll_user_access_key(user_id uuid) RETURNS void AS $$
BEGIN
  UPDATE users
  SET "accessKey" = gen_random_uuid()
  WHERE id = user_id;
END
$$ LANGUAGE 'plpgsql';
