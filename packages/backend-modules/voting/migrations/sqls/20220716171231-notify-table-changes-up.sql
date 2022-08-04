CREATE TRIGGER trigger_answers_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON answers
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();

CREATE TRIGGER trigger_questions_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON questions
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();

CREATE TRIGGER trigger_questionnaire_submissions_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON "questionnaireSubmissions"
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();
