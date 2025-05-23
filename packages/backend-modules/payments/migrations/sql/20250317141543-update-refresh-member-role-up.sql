-- migrate up here: CREATE TABLE...

-- replace refresh_member_role in packages/backend-modules/republik/migrations/sqls/20180402175144-fix-membership-trigger-up.sql
-- to keep the member role if the user has an active subscription.
CREATE OR REPLACE FUNCTION public.refresh_member_role(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
   _active boolean;
   _role text := 'member';
BEGIN
  -- Check if the user has an active membership or an active subscription
  SELECT
    COALESCE(bool_or(m.active), false) OR
    EXISTS (
      SELECT 1 FROM payments.subscriptions s
      WHERE s."userId" = user_id
      AND s.status NOT IN ('paused', 'canceled', 'incomplete', 'incomplete_expired')
    ) INTO _active
  FROM
    users u
  LEFT JOIN
    memberships m ON m."userId" = u.id
  WHERE
    u.id = user_id;

  IF _active = true THEN
    PERFORM add_user_to_role(user_id, _role);
  ELSE
    PERFORM remove_user_from_role(user_id, _role);
  END IF;
END;
$function$
