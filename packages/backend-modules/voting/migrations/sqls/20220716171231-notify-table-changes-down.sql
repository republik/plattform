DROP TRIGGER IF EXISTS trigger_questions_notify_change
  ON questions;

DROP TRIGGER IF EXISTS trigger_answers_notify_change
  ON answers;

DROP TRIGGER IF EXISTS trigger_questionnaire_submissions_notify_change
  ON "questionnaireSubmissions";
