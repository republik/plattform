CREATE DOMAIN subscription_filter AS TEXT
CHECK(
  VALUE IN ('COMMENTS', 'DOCUMENTS')
);


CREATE TABLE subscriptions (
  "id"                 uuid primary key not null default uuid_generate_v4(),
  "userId"             uuid not null references "users" on update cascade on delete cascade,
  "filters"            jsonb,
  "objectUserId"       uuid references "users",
  "objectDocumentId"   text,
  "objectDiscussionId" uuid references "discussions",
  "createdAt"          timestamptz default now(),
  "updatedAt"          timestamptz default now()
);
-- TODO unique constraint

-- TODO trigger to ensure object column integrity
