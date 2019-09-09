ALTER TABLE "questionnaires"
  DROP COLUMN "submitAnswersImmediately",
  DROP COLUMN "updateResultIncrementally",
  DROP COLUMN "noEmptyAnswers"
;

ALTER TABLE "answers"
  ALTER COLUMN "userId" SET NOT NULL,
  DROP COLUMN "pseudonym"
;

DROP TRIGGER IF EXISTS check_answer ON "answers";
DROP FUNCTION IF EXISTS check_answer_trg();

CREATE FUNCTION check_answer_trg() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT FROM "questionnaireSubmissions"
    WHERE
      "questionnaireId" = NEW."questionnaireId" AND
      "userId" = NEW."userId"
  ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: user already submitted questionnaire';
  END IF;
  IF (SELECT "questionnaireId" FROM "questions" WHERE id = NEW."questionId") != NEW."questionnaireId" THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: claimed questionnaireId != question.questionnaireId';
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_answer
BEFORE INSERT OR UPDATE ON "answers"
FOR EACH ROW
EXECUTE PROCEDURE check_answer_trg();
