CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE "mailLog" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "type"            character varying not null,
  "userId"          uuid references "users" on update cascade on delete set null,
  "email"           citext not null,
  "membershipIds"   uuid[],
  "info"            jsonb,
  "resultOk"        boolean,
  "resultPayload"   jsonb,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE INDEX IF NOT EXISTS "mail_log_type_idx" ON "mailLog" ("type");
CREATE INDEX IF NOT EXISTS "mail_log_user_id_idx" ON "mailLog" ("userId");
CREATE INDEX IF NOT EXISTS "mail_log_email_lower_idx" ON "mailLog"(lower("email"));
CREATE INDEX IF NOT EXISTS "mail_log_membership_ids_idx" ON "mailLog" USING gin ("membershipIds");
