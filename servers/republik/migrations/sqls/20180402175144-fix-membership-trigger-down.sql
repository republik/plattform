DROP TRIGGER IF EXISTS trigger_member_role ON memberships;

DROP FUNCTION IF EXISTS refresh_member_role_trigger_function;
DROP FUNCTION IF EXISTS refresh_member_role;
DROP FUNCTION IF EXISTS remove_user_from_role;
DROP FUNCTION IF EXISTS add_user_to_role;

-- to restore the original trigger, see: servers/republik/migrations/sqls/20171127165339-recurring-membership-periods-up.sql:64
