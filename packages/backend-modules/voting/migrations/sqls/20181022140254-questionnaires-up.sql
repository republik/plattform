create table if not exists "questionnaires" (
  "id"           uuid primary key not null default uuid_generate_v4(),
  "slug"         varchar          not null,
  "description"  varchar          not null,
  "beginDate"    timestamptz      not null,
  "endDate"      timestamptz      not null,
  "allowedRoles" jsonb,

  "result"       jsonb,

  "createdAt"    timestamptz               default now(),
  "updatedAt"    timestamptz               default now(),
  unique ("slug")
);

CREATE TABLE "questionnaireMembershipRequirements" (
  "questionnaireId" uuid NOT NULL REFERENCES "questionnaires"(id) ON UPDATE cascade ON DELETE cascade,
  "membershipTypeId" uuid NOT NULL REFERENCES "membershipTypes"(id),
  "createdBefore" timestamp with time zone NOT NULL DEFAULT now()
);


CREATE DOMAIN question_type AS TEXT
  CHECK(
    VALUE IN ('Text', 'Choice', 'Range', 'Document')
  );

CREATE TABLE "questions" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "questionnaireId" uuid NOT NULL REFERENCES "questionnaires"(id) ON UPDATE cascade ON DELETE cascade,
  "order"       integer not null default 1,
  "text"        text not null,
  "type"        question_type not null,
  "typePayload" jsonb,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  unique("questionnaireId", "order")
);

CREATE TABLE "questionnaireSubmissions" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "questionnaireId" uuid NOT NULL REFERENCES "questionnaires"(id) ON UPDATE cascade,
  "userId"        uuid NOT NULL REFERENCES "users" ON UPDATE CASCADE,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now(),
  unique("questionnaireId", "userId")
);

CREATE TABLE "answers" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "questionnaireId" uuid NOT NULL REFERENCES "questionnaires"(id) ON UPDATE cascade ON DELETE cascade,
  "questionId"  uuid NOT NULL REFERENCES "questions"(id) ON UPDATE cascade,
  "userId"      uuid NOT NULL REFERENCES "users" ON UPDATE CASCADE,
  "payload"     jsonb not null,
  "submitted"   boolean not null default false,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  unique("questionId", "userId")
);

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


CREATE INDEX IF NOT EXISTS "questionnaire_membership_requirements_questionnaire_id_idx" ON "questionnaireMembershipRequirements"("questionnaireId");
CREATE INDEX IF NOT EXISTS "questionnaire_membership_requirements_membership_type_id_idx" ON "questionnaireMembershipRequirements"("membershipTypeId");

CREATE INDEX IF NOT EXISTS "question_questionnaire_id_idx" ON "questions"("questionnaireId");
CREATE INDEX IF NOT EXISTS "question_type_idx" ON "questions"("type");

CREATE INDEX IF NOT EXISTS "questionnaire_submissions_questionnaire_id_idx" ON "questionnaireSubmissions"("questionnaireId");
CREATE INDEX IF NOT EXISTS "questionnaire_submissions_user_id_idx" ON "questionnaireSubmissions"("userId");

CREATE INDEX IF NOT EXISTS "answer_questionnaire_id_idx" ON "answers"("questionnaireId");
CREATE INDEX IF NOT EXISTS "answer_question_id_idx" ON "answers"("questionId");
CREATE INDEX IF NOT EXISTS "answer_user_id_idx" ON "answers"("userId");
CREATE INDEX IF NOT EXISTS "answer_payload_value_idx" ON "answers"(("payload"->>'value'));

CREATE INDEX IF NOT EXISTS "answer_submitted_idx" ON "answers"("submitted");
