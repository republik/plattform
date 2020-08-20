alter table "payments"
  add column if not exists "remindersSentAt" jsonb;
