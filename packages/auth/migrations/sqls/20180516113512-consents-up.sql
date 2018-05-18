CREATE TABLE "consents" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "userId"        uuid references users(id),
  "policy"        text NOT NULL,
  "ip"            text,
  "createdAt"     timestamptz NOT NULL default now()
);
