CREATE TABLE "additionalDaysActions" (
  "id"                       uuid primary key not null default uuid_generate_v4(),
  "beginDate"                timestamptz not null,
  "endDate"                  timestamptz not null,
  "membershipTypeId"         uuid not null references "membershipTypes",
  "minCreatedAt"             timestamptz not null,
  "maxCreatedAt"             timestamptz not null,
  "additionalDaysBeforeDate" timestamptz not null
) ;

-- generic possibility:
CREATE TABLE "actions" (
  "id"                       uuid primary key not null default uuid_generate_v4(),
  "beginDate"                timestamptz not null,
  "endDate"                  timestamptz not null,
  "config"                   jsonb not null
) ;

ALTER TABLE "packages"
  ADD COLUMN "custom" boolean NOT NULL DEFAULT false;

ALTER TABLE "membershipPeriods"
  ADD COLUMN "kind" character varying
    NOT NULL
    DEFAULT 'REGULAR'::character varying ;
