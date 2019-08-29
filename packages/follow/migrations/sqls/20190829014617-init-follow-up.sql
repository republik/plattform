CREATE DOMAIN follow_entity AS TEXT
CHECK(
  VALUE IN ('USER_COMMENTS', 'DOCUMENTS')
);


CREATE TABLE follows (
  "id"               uuid primary key not null default uuid_generate_v4(),
  "subjectId"        uuid not null references "users" on update cascade on delete cascade,
  "entity"           follow_entity not null,
  "objectUserId"     uuid references "users",
  "objectDocumentId" text
);

