DROP TABLE IF EXISTS "answers";

DROP TRIGGER IF EXISTS check_answer ON answers;
DROP FUNCTION IF EXISTS check_answer_trg();

DROP TABLE IF EXISTS "questions";
DROP DOMAIN question_type;

DROP TABLE IF EXISTS "questionnaireSubmissions";

DROP TABLE IF EXISTS "questionnaireMembershipRequirements";
DROP TABLE IF EXISTS "questionnaires";


DROP INDEX IF EXISTS "questionnaire_membership_requirements_questionnaire_id_idx";
DROP INDEX IF EXISTS "questionnaire_membership_requirements_membership_type_id_idx";
DROP INDEX IF EXISTS "question_questionnaire_id_idx";
DROP INDEX IF EXISTS "question_type_idx";
DROP INDEX IF EXISTS "questionnaire_submissions_questionnaire_id_idx";
DROP INDEX IF EXISTS "questionnaire_submissions_user_id_idx";
DROP INDEX IF EXISTS "answer_questionnaire_id_idx";
DROP INDEX IF EXISTS "answer_question_id_idx";
DROP INDEX IF EXISTS "answer_user_id_idx";
DROP INDEX IF EXISTS "answer_payload_idx";
DROP INDEX IF EXISTS "answer_submitted_idx";
