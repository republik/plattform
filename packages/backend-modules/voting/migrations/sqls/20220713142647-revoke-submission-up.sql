ALTER TABLE "public"."questionnaires"
  ADD COLUMN "revokeSubmissions" boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT "revokeSubmissions_submitAnswersImmediately_incompatibility" CHECK (
    "revokeSubmissions" = FALSE OR
    (
      "revokeSubmissions" = TRUE AND 
      "submitAnswersImmediately" = FALSE
    )
  ),
  ADD CONSTRAINT "revokeSubmissions_updateResultIncrementally_incompatibility" CHECK (
    "revokeSubmissions" = FALSE OR
    (
      "revokeSubmissions" = TRUE AND 
      "updateResultIncrementally" = FALSE
    )
  ),
  ADD CONSTRAINT "revokeSubmissions_unattributedAnswers_incompatibility" CHECK (
    "revokeSubmissions" = FALSE OR
    (
      "revokeSubmissions" = TRUE AND 
      "unattributedAnswers" = FALSE
    )
  )
;

DROP TRIGGER IF EXISTS check_answer ON "answers";
DROP FUNCTION IF EXISTS check_answer_trg();

CREATE FUNCTION check_answer_trg() RETURNS trigger AS $$
DECLARE
_questionnaire_revoke_submissions boolean;
_questionnaire_resubmit_answers boolean;
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

  _questionnaire_revoke_submissions := (
    SELECT "revokeSubmissions"
    FROM "questionnaires"
    WHERE id = NEW."questionnaireId"
  );

  IF (
    TG_OP = 'UPDATE' AND
    NEW."submitted" = false AND
    OLD."submitted" = true AND
    _questionnaire_revoke_submissions IS NOT TRUE
    ) THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: answers must not be unsubmitted';
  END IF;

  _questionnaire_resubmit_answers := (
    SELECT "resubmitAnswers"
    FROM "questionnaires"
    WHERE id = NEW."questionnaireId"
  );

  IF (
    TG_OP = 'UPDATE' AND
    OLD."submitted" = true AND
    NEW."payload" IS DISTINCT FROM OLD."payload" AND
    _questionnaire_revoke_submissions IS NOT TRUE AND
    _questionnaire_resubmit_answers IS NOT TRUE
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
    _user_questionnaire_submission_id IS NOT NULL AND
    _questionnaire_revoke_submissions IS NOT TRUE AND
    _questionnaire_resubmit_answers IS NOT TRUE
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