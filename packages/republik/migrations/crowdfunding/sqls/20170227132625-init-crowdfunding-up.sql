CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- https://www.postgresql.org/docs/9.1/static/plpgsql-statements.html#PLPGSQL-QUOTE-LITERAL-EXAMPLE
-- http://stackoverflow.com/questions/19530736/how-can-i-generate-a-unique-string-per-record-in-a-table-in-postgres
-- http://stackoverflow.com/questions/5997241/postgresql-is-there-a-function-that-will-convert-a-base-10-int-into-a-base-36-s
-- https://www.techonthenet.com/postgresql/functions/random.php
CREATE FUNCTION make_hrid(IN _tbl regclass, IN _column text, IN digits bigint) RETURNS text AS $$
DECLARE
chars char[];
new_hrid text;
done bool;
BEGIN
  chars := ARRAY['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','K','L','M','R','S','T','U','W','X','Y','Z'];
  done := false;
  <<doneloop>>
  WHILE NOT done LOOP
    new_hrid := '';
    <<hridloop>>
    WHILE char_length(new_hrid) < digits LOOP
      new_hrid := new_hrid || chars[floor(random()*(array_length(chars, 1)-1+1))+1];
    END LOOP hridloop;
    EXECUTE format('SELECT (NOT EXISTS (SELECT 1 FROM "%s" WHERE "%s" = %L))::bool', _tbl, _column, new_hrid) INTO done;
  END LOOP doneloop;
  RETURN new_hrid;
END;
$$ LANGUAGE PLPGSQL VOLATILE;

create table "crowdfundings" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "name"        varchar not null,
  "beginDate"   timestamptz not null,
  "endDate"     timestamptz not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

create table "crowdfundingGoals" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "crowdfundingId"  uuid not null references "crowdfundings" on update cascade on delete cascade,
  "name"            text not null unique,
  "people"          integer not null,
  "money"           integer not null,
  "description"     text,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

create table "packages" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "crowdfundingId"  uuid not null references "crowdfundings" on update cascade on delete cascade,
  "name"            varchar not null,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

create type "rewardType" as ENUM ('Goodie', 'MembershipType');
create table "rewards" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "type"            "rewardType" not null,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  unique ("id", "type")
);

create table "packageOptions" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "packageId"       uuid not null references "packages" on update cascade on delete cascade,
  "rewardId"        uuid references "rewards" on update cascade on delete cascade,
--  "name"            varchar not null,
  "minAmount"       integer not null,
  "maxAmount"       integer not null,
  "defaultAmount"   integer not null,
  "price"           integer not null,
  "userPrice"       boolean not null default false,
  "minUserPrice"    integer not null default 0,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

create table "goodies" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "rewardId"    uuid not null unique,
  "rewardType"  "rewardType" not null check ("rewardType" = 'Goodie'),
  "name"        varchar not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  foreign key ("rewardId", "rewardType") references "rewards" ("id", "type") on update cascade on delete cascade
);

create table "membershipTypes" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "rewardId"    uuid not null unique,
  "rewardType"  "rewardType" not null check ("rewardType" = 'MembershipType'),
  "name"        varchar not null,
  "duration"    integer not null,
  "price"       integer not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  foreign key ("rewardId", "rewardType") references "rewards" ("id", "type") on update cascade on delete cascade
);

create type "pledgeStatus" as ENUM ('DRAFT', 'WAITING_FOR_PAYMENT', 'PAID_INVESTIGATE', 'SUCCESSFUL', 'CANCELLED');
create table "pledges" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "packageId"       uuid not null references "packages" on update cascade on delete cascade,
  "userId"          uuid not null references "users" on update cascade on delete cascade,
  "status"          "pledgeStatus" not null default 'DRAFT',
  "reason"          text,
  "total"           integer not null,
  "donation"        integer not null,
  "sendConfirmMail" boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
create index "pledges_userId_idx" on "pledges" ("userId");

create table "pledgeOptions" (
  "templateId"  uuid not null references "packageOptions"(id) on update cascade on delete cascade,
  "pledgeId"    uuid not null references "pledges"(id) on update cascade on delete cascade,
  "amount"      integer not null,
  "price"       integer not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  PRIMARY KEY ("templateId", "pledgeId")
);
create index "pledgeOptions_pledgeId_idx" on "pledgeOptions" ("pledgeId");


create type "paymentMethod" as ENUM ('STRIPE', 'POSTFINANCECARD', 'PAYPAL', 'PAYMENTSLIP');
create type "paymentStatus" as ENUM ('WAITING', 'PAID', 'WAITING_FOR_REFUND', 'REFUNDED', 'CANCELLED');
create type "paymentType" as ENUM ('PLEDGE');
create table "payments" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "type"          "paymentType" not null,
  "method"        "paymentMethod" not null,
  "paperInvoice"  boolean not null default false,
  "total"         integer not null,
  "status"        "paymentStatus" not null default 'WAITING',
  "hrid"          text unique not null default make_hrid('payments', 'hrid', 6),
  "pspId"         text,
  "pspPayload"    jsonb,
  "dueDate"       date,
  "exported"      boolean not null default false,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now(),
  unique ("id", "type")
);

create table "pledgePayments" (
  "id"           uuid primary key not null default uuid_generate_v4(),
  "pledgeId"     uuid not null references "pledges"(id) on update cascade on delete cascade,
  "paymentId"    uuid not null unique,
  "paymentType"  "paymentType" not null check ("paymentType" = 'PLEDGE'),
  "createdAt"    timestamptz default now(),
  "updatedAt"    timestamptz default now(),
  foreign key ("paymentId", "paymentType") references "payments" ("id", "type") on update cascade on delete cascade
);
create index "pledgePayments_pledgeId_idx" on "pledgePayments" ("pledgeId");
create index "pledgePayments_createdAt_idx" on "pledgePayments" ("createdAt");
-- pledgePayments_paymentId_idx is implicit

create table "paymentSources" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "method"      "paymentMethod" not null,
  "userId"      uuid references "users" on update cascade on delete cascade,
  "pspId"       varchar,
  "pspPayload"  jsonb,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);


create table "memberships" (
  "id"                uuid primary key not null default uuid_generate_v4(),
  "userId"            uuid references "users" on update cascade on delete cascade,
  "pledgeId"          uuid not null references "pledges"(id) on update cascade on delete cascade,
  "membershipTypeId"  uuid not null references "membershipTypes"(id) on update cascade on delete cascade,
  "beginDate"         timestamptz not null,
  "voucherCode"       text unique,
  "reducedPrice"      boolean not null default false,
  "sequenceNumber"    SERIAL,
  "createdAt"         timestamptz default now(),
  "updatedAt"         timestamptz default now()
);
create index "memberships_userId_idx" on "memberships" ("userId");
create index "memberships_pledgeId" on "memberships" ("pledgeId");
create index "memberships_sequenceNumber_idx" on "memberships" ("sequenceNumber");


CREATE FUNCTION voucher_code_trigger_function()
RETURNS trigger AS $$
BEGIN
  IF NEW."reducedPrice" IS false THEN
    NEW."voucherCode" := make_hrid('memberships', 'voucherCode', 6);
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_voucher_code
BEFORE INSERT ON memberships
FOR EACH ROW
EXECUTE PROCEDURE voucher_code_trigger_function();


create table "postfinancePayments" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "buchungsdatum"   date not null,
  "valuta"          date not null,
  "avisierungstext" text not null,
  "gutschrift"      integer not null,
  "mitteilung"      text,
  "matched"         boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  unique ("buchungsdatum", "valuta", "avisierungstext", "gutschrift")
);

create table "cashPayments" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "hrid"            text not null,
  "matched"         boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  unique ("hrid")
);


create table "paymentsLog" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "method"          "paymentMethod" not null,
  "pspPayload"      jsonb,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
