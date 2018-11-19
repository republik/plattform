CREATE DOMAIN cancel_category AS TEXT
  CHECK(
    VALUE IN ('EDITORIAL', 'NO_TIME', 'VAUNT', 'LOGIN', 'PAPER', 'NO_AUTO_RENEWAL', 'TOO_EXPENSIVE', 'OTHER')
  );

CREATE TABLE "membershipCancellations" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "membershipId"    uuid not null references "memberships",
  "reason"          text,
  "category"        cancel_category not null,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
