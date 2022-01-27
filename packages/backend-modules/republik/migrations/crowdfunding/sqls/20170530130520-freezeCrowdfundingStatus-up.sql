alter table "crowdfundings"
  add column if not exists "result" jsonb;
