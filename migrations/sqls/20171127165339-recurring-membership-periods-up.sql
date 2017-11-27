
create table "membershipPeriods" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "membershipId"  uuid not null references "memberships" on update cascade on delete cascade,
  "beginDate"     timestamptz not null,
  "endDate"       timestamptz not null,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now()
);

-- do this manually
--ALTER TYPE "paymentType" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PERIOD' AFTER 'PLEDGE';

create table "membershipPeriodPayments" (
  "id"                   uuid primary key not null default uuid_generate_v4(),
  "membershipPeriodId"   uuid not null references "membershipPeriods"(id) on update cascade on delete cascade,
  "paymentId"            uuid not null unique,
  "paymentType"          "paymentType" not null check ("paymentType" = 'MEMBERSHIP_PERIOD'),
  "createdAt"            timestamptz default now(),
  "updatedAt"            timestamptz default now(),
  foreign key ("paymentId", "paymentType") references "payments" ("id", "type") on update cascade on delete cascade
);
create index "membershipPeriodPayments_pledgeId_idx" on "membershipPeriodPayments" ("membershipPeriodId");
create index "membershipPeriodPayments_createdAt_idx" on "membershipPeriodPayments" ("createdAt");

alter table "memberships"
  add column "active" boolean not null default false;

-- run activateMemberships now
