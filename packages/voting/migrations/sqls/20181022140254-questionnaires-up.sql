create table if not exists "questionnaires" (
  "id"           uuid primary key not null default uuid_generate_v4(),
  "slug"         varchar          not null,
  "description"  varchar          not null,
  "beginDate"    timestamptz      not null,
  "endDate"      timestamptz      not null,
  "allowedRoles" jsonb,

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
    VALUE IN ('Text', 'Choice', 'Range', 'Article', 'Format')
  );

CREATE TABLE "questions" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "questionnaireId" uuid NOT NULL REFERENCES "questionnaires"(id) ON UPDATE cascade ON DELETE cascade,
  "order"       integer not null default 1,
  "text"        text not null,
  "type"        question_type not null,
  "typePayload" jsonb,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);
