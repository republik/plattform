CREATE TABLE "userAttributes" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "userId"          uuid references "users" on update cascade on delete set null,
  "name"            text not null,
  "value"           text,
  "createdAt"       timestamp with time zone default now()
);


CREATE INDEX IF NOT EXISTS "user_attributes_user_id_idx" ON "userAttributes" ("userId");
CREATE INDEX IF NOT EXISTS "user_attributes_name_idx" ON "userAttributes" ("name");
CREATE INDEX IF NOT EXISTS "user_attributes_value_idx" ON "userAttributes" ("value");
CREATE INDEX IF NOT EXISTS "user_attributes_user_id_name_idx" ON "userAttributes" ("userId", "name");
