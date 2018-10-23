DROP TABLE IF EXISTS "answers";

DROP TRIGGER IF EXISTS check_answer ON answers;
DROP FUNCTION IF EXISTS check_answer_trg();

DROP TABLE IF EXISTS "questions";
DROP DOMAIN question_type;

DROP TABLE IF EXISTS "questionnaireSubmissions";

DROP TABLE IF EXISTS "questionnaireMembershipRequirements";
DROP TABLE IF EXISTS "questionnaires";

