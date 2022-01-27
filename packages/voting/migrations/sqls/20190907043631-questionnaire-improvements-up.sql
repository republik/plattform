ALTER TABLE "questionnaires"
  ADD COLUMN "submitAnswersImmediately" boolean not null default false,
  ADD COLUMN "updateResultIncrementally" boolean not null default false,
  ADD COLUMN "noEmptyAnswers" boolean not null default false
;

ALTER TABLE "answers"
  ALTER COLUMN "userId" DROP NOT NULL,
  ADD COLUMN "pseudonym" uuid
;

DROP TRIGGER IF EXISTS check_answer ON "answers";
DROP FUNCTION IF EXISTS check_answer_trg();

CREATE FUNCTION check_answer_trg() RETURNS trigger AS $$
DECLARE
_user_id uuid;
_user_questionnaire_submission_id uuid;
BEGIN
  IF (
    TG_OP = 'UPDATE' AND
    NEW."userId" IS NOT NULL AND
    NEW."userId" != OLD."userId"
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: answers must not switch users';
  END IF;

  IF (
    TG_OP = 'UPDATE' AND
    NEW."userId" IS NULL AND
    NEW."pseudonym" IS NULL
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: answers without a user must have a pseudonym';
  END IF;

  IF (
    TG_OP = 'UPDATE' AND
    NEW."questionId" != OLD."questionId"
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: answers must not switch questions';
  END IF;

  IF (
    TG_OP = 'UPDATE' AND
    NEW."submitted" = false AND
    OLD."submitted" = true
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: answers must not be unsubmitted';
  END IF;

  IF (
    TG_OP = 'UPDATE' AND
    OLD."submitted" = true AND
    NEW."payload" IS DISTINCT FROM OLD."payload"
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: submitted answers payload must not be changed';
  END IF;

  IF (
    (SELECT "questionnaireId" FROM "questions" WHERE id = NEW."questionId") != NEW."questionnaireId"
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: claimed answer.questionnaireId != question.questionnaireId';
  END IF;

  IF (TG_OP = 'INSERT') THEN
    _user_id := NEW."userId";
  ELSE
    _user_id := OLD."userId";
  END IF;

  _user_questionnaire_submission_id := (
    SELECT "id"
    FROM "questionnaireSubmissions"
    WHERE
    "questionnaireId" = NEW."questionnaireId" AND
    "userId" = _user_id
  );

  IF (
    NEW."userId" IS NOT NULL AND
    _user_questionnaire_submission_id IS NOT NULL
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: user already submitted questionnaire';
  END IF;

  IF (
    NEW."userId" IS NULL AND
    OLD."userId" IS NOT NULL AND
    _user_questionnaire_submission_id IS NULL
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: missing user`s questionnaireSubmissions';
  END IF;

  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_answer
BEFORE INSERT OR UPDATE ON "answers"
FOR EACH ROW
  EXECUTE PROCEDURE check_answer_trg()
;
