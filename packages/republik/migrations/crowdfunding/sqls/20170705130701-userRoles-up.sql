alter table "users"
  add column if not exists "roles" jsonb;
