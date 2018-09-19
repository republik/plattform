DROP TABLE IF EXISTS "elections" CASCADE;
DROP TABLE IF EXISTS "electionCandidacies" CASCADE;
DROP TABLE IF EXISTS "electionBallots";

DROP FUNCTION IF EXISTS refresh_associate_role();
DROP FUNCTION IF EXISTS refresh_associate_role_trigger_function();
DROP TRIGGER trigger_associate_role;
SELECT remove_user_from_role(id, 'associate') FROM users;
