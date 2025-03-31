-- migrate down here: DROP TABLE...
CREATE OR REPLACE FUNCTION public.refresh_member_role(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
   _active boolean;
   _role text := 'member';
BEGIN
  -- Revert to checking only active memberships
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
$function$
