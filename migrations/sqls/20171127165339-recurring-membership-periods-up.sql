alter table "memberships"
  drop column "beginDate",
  add column "active" boolean not null default false,
  add column "renew" boolean not null default false,
  add column "subscriptionId" text,
  add column "latestPaymentFailedAt" timestamptz;

create type "intervalType" as ENUM ('year', 'month', 'week', 'day');

alter table "membershipTypes"
  drop column "duration",
  add column "interval" "intervalType" not null default 'year',
  add column "intervalCount" integer not null default 1;

create table "membershipPeriods" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "membershipId"    uuid not null references "memberships" on update cascade on delete cascade,
  "beginDate"       timestamptz not null,
  "endDate"         timestamptz not null,
  "webhookEventId"  text,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

-- can't apply this in the migration (transaction), please run it manually before this migrations
-- ALTER TYPE "paymentType" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PERIOD' AFTER 'PLEDGE';

--create table "membershipPeriodPayments" (
--  "id"                   uuid primary key not null default uuid_generate_v4(),
--  "membershipPeriodId"   uuid not null references "membershipPeriods"(id) on update cascade on delete cascade,
--  "paymentId"            uuid not null unique,
--  "paymentType"          "paymentType" not null check ("paymentType" = 'MEMBERSHIP_PERIOD'),
--  "createdAt"            timestamptz default now(),
--  "updatedAt"            timestamptz default now(),
--  foreign key ("paymentId", "paymentType") references "payments" ("id", "type") on update cascade on delete cascade
--);
--create index "membershipPeriodPayments_pledgeId_idx" on "membershipPeriodPayments" ("membershipPeriodId");
--create index "membershipPeriodPayments_createdAt_idx" on "membershipPeriodPayments" ("createdAt");


-- only generate voucherCode if voucherable is true
alter table "memberships"
  add column "voucherable" boolean not null default true;
drop trigger if exists trigger_voucher_code ON memberships;
drop function if exists voucher_code_trigger_function();

CREATE FUNCTION voucher_code_trigger_function()
RETURNS trigger AS $$
BEGIN
  IF NEW."voucherable" IS true THEN
    NEW."voucherCode" := make_hrid('memberships', 'voucherCode', 6);
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_voucher_code
BEFORE INSERT ON memberships
FOR EACH ROW
EXECUTE PROCEDURE voucher_code_trigger_function();


-- maintain member role
CREATE FUNCTION refresh_member_role_function()
RETURNS trigger AS $$
DECLARE
   _active boolean;
   _role text := 'member';
   _role_array jsonb := '["member"]';
BEGIN
  SELECT
    COALESCE(bool_or(active), false) INTO _active
  FROM
    memberships m
  JOIN
    users u
    ON m."userId"=u.id
  WHERE
    u.id = NEW."userId";

  IF _active = true THEN
    UPDATE
      users
    SET
      roles = COALESCE(roles, '[]'::jsonb)::jsonb || _role_array::jsonb
    WHERE
      id = NEW."userId" AND
      (roles IS NULL OR NOT roles @> _role_array);
  ELSE
    UPDATE
      users
    SET
      roles = roles - _role
    WHERE
      id = NEW."userId";
  END IF;

  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_member_role
AFTER INSERT OR UPDATE ON memberships
FOR EACH ROW
EXECUTE PROCEDURE refresh_member_role_function();

-- ready to run activateMemberships and launch now
