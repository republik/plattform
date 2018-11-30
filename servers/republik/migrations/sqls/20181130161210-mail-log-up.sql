CREATE TABLE "mailLog" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "type"            character varying not null,
  "payload"         jsonb,
  "resultOk"        boolean,
  "resultPayload"   jsonb,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
