CREATE TABLE "eventLog" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "schemaName"  text NOT NULL,
  "tableName"   text NOT NULL,
  "query"       text NOT NULL,
  "action"			text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  "oldData"     jsonb,
  "newData"     jsonb,
  "userId"      uuid references "users",
  "createdAt"   timestamptz default now()
);
