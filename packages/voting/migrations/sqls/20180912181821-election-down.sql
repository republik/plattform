DROP TABLE IF EXISTS "elections" CASCADE;
DROP TABLE IF EXISTS "electionCandidacies" CASCADE;
DROP TABLE IF EXISTS "electionBallots";

DROP TRIGGER IF EXISTS trigger_associate_role ON memberships;
DROP FUNCTION IF EXISTS refresh_associate_role(user_id uuid);
DROP FUNCTION IF EXISTS refresh_associate_role_trigger_function();
SELECT remove_user_from_role(id, 'associate') FROM users;
