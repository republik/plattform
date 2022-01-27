DROP TRIGGER IF EXISTS trigger_member_role ON memberships;
DROP FUNCTION IF EXISTS refresh_member_role_function();

CREATE OR REPLACE FUNCTION add_user_to_role(user_id uuid, role text)
RETURNS void AS $$
BEGIN
  UPDATE
    users
  SET
    roles = COALESCE(roles, '[]'::jsonb)::jsonb || jsonb_build_array(role)
  WHERE
    id = user_id AND
    (roles IS NULL OR NOT roles @> jsonb_build_array(role));
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION remove_user_from_role(user_id uuid, role text)
RETURNS void AS $$
BEGIN
  UPDATE
    users
  SET
    roles = roles - role
  WHERE
    id = user_id;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION refresh_member_role(user_id uuid)
RETURNS void AS $$
DECLARE
   _active boolean;
   _role text := 'member';
BEGIN
  SELECT
    COALESCE(bool_or(active), false) INTO _active
  FROM
    memberships m
  JOIN
    users u
    ON m."userId"=u.id
  WHERE
    u.id = user_id;

  IF _active = true THEN
    PERFORM add_user_to_role(user_id, _role);
  ELSE
    PERFORM remove_user_from_role(user_id, _role);
  END IF;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION refresh_member_role_trigger_function()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM refresh_member_role(NEW."userId");
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM refresh_member_role(NEW."userId");
    PERFORM refresh_member_role(OLD."userId");
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM refresh_member_role(OLD."userId");
    RETURN OLD;
  END IF;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_member_role
AFTER INSERT OR UPDATE OR DELETE ON memberships
FOR EACH ROW
EXECUTE PROCEDURE refresh_member_role_trigger_function();
