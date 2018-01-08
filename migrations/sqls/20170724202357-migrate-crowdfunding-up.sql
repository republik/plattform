CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create type "accessRole" as ENUM (
  'ADMIN',
  'EDITOR',
  'MEMBER',
  'PUBLIC'
);

ALTER TABLE users
  ADD COLUMN "portraitUrl"           text,
  ADD COLUMN "statement"             text,
  ADD COLUMN "isListed"              boolean not null default false,
  ADD COLUMN "isAdminUnlisted"       boolean not null default false,
  ADD COLUMN "testimonialId"         uuid unique,
  ADD COLUMN "facebookId"            text,
  ADD COLUMN "twitterHandle"         text,
  ADD COLUMN "publicUrl"             text,
  ADD COLUMN "badges"                jsonb,
  ADD COLUMN "biography"             text,
  ADD COLUMN "pgpPublicKey"          text,
  ADD COLUMN "phoneNumberNote"       text,
  ADD COLUMN "phoneNumberAccessRole" "accessRole" not null default 'ADMIN',
  ADD COLUMN "emailAccessRole"       "accessRole" not null default 'ADMIN',
  ADD COLUMN "ageAccessRole"         "accessRole" not null default 'ADMIN'
;

-- carry testimonials images over as portaits
UPDATE users u
SET    "portraitUrl"     = t.image,
       "statement"       = t.quote,
       "isListed"        = t.published,
       "isAdminUnlisted" = t."adminUnpublished",
       "testimonialId"   = t.id
FROM   testimonials t
WHERE  u.id = t."userId";


CREATE SCHEMA IF NOT EXISTS cf;

ALTER TABLE IF EXISTS comments SET SCHEMA cf;
ALTER TABLE IF EXISTS feeds SET SCHEMA cf;

-- discussion
create type "permission" as ENUM (
  'ALLOWED',
  'ENFORCED',
  'FORBIDDEN'
);

create table "discussions" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "title"               text,
  "maxLength"           integer,
  "minInterval"         integer,
  "anonymity"           "permission" not null default 'ALLOWED',
  "documentPath"        text,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now()
);

create table "comments" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "discussionId"        uuid not null references "discussions",
  "parentIds"           jsonb,
  "userId"              uuid not null references "users",
  "content"             text,
  "upVotes"             integer not null default 0,
  "downVotes"           integer not null default 0,
  "votes"               jsonb not null default '[]',
  "hotness"             float not null,
  "depth"               integer not null default 0,
  "published"           boolean not null default true,
  "adminUnpublished"    boolean not null default false,
  "reportedBy"          jsonb,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now()
);
create index "comments_content_idx" on "comments" using GIN ("content" gin_trgm_ops);
create index "comments_votes_idx" ON "comments" using GIN ("votes");

create table "credentials" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "userId"              uuid not null references "users",
  "description"         text not null,
  "isListed"            boolean not null default false,
  "verified"            boolean not null default false,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  UNIQUE("userId", "description")
);
CREATE index "credentials_description_idx" on "credentials" using GIN ("description" gin_trgm_ops);

create table "discussionPreferences" (
  "userId"              uuid not null references "users",
  "discussionId"        uuid not null references "discussions",
  "anonymous"           boolean not null default false,
  "credentialId"        uuid references "credentials",
  PRIMARY KEY ("userId", "discussionId")
);
-- /discussion


-- copy existing feeds to new discussions API
INSERT INTO
  discussions(id, "maxLength", "minInterval")
SELECT
  id, "commentMaxLength", "commentInterval"
FROM cf.feeds;

INSERT INTO comments(
  "id",
  "discussionId",
  "userId",
  "content",
  "upVotes",
  "downVotes",
  "votes",
  "hotness",
  "published",
  "adminUnpublished",
  "createdAt",
  "updatedAt"
) SELECT
  "id",
  "feedId",
  "userId",
  "content",
  "upVotes",
  "downVotes",
  "votes",
  "hottnes",
  "published",
  "adminUnpublished",
  "createdAt",
  "updatedAt"
FROM cf.comments;

INSERT INTO
  credentials("userId", "description", "isListed")
SELECT
  "userId", "role", true
FROM testimonials
WHERE
  role is not null;

DROP TABLE testimonials;

-- add companies
CREATE TABLE companies(
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "name"                text not null,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  UNIQUE("name")
);

INSERT INTO companies("name") VALUES ('PROJECT_R');
INSERT INTO companies("name") VALUES ('REPUBLIK');

ALTER TABLE "packages" ADD COLUMN "companyId" uuid references "companies";
ALTER TABLE "membershipTypes" ADD COLUMN "companyId" uuid references "companies";
ALTER TABLE "paymentSources" ADD COLUMN "companyId" uuid references "companies";

UPDATE packages SET "companyId" = (SELECT id FROM companies WHERE name = 'PROJECT_R');
UPDATE "membershipTypes" SET "companyId" = (SELECT id FROM companies WHERE name = 'PROJECT_R');
UPDATE "paymentSources" SET "companyId" = (SELECT id FROM companies WHERE name = 'PROJECT_R');

ALTER TABLE "packages" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "membershipTypes" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "paymentSources" ALTER COLUMN "companyId" SET NOT NULL;

-- stripe customers
CREATE TABLE "stripeCustomers"(
  "id"                  text not null,
  "userId"              uuid not null references "users",
  "companyId"           uuid not null references "companies",
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  UNIQUE("userId", "companyId")
);

-- paymentMethods on packages
ALTER TABLE "packages" ADD COLUMN "paymentMethods" "paymentMethod"[];
UPDATE "packages"
  SET "paymentMethods" = '{STRIPE, POSTFINANCECARD, PAYPAL, PAYMENTSLIP}'::"paymentMethod"[];
ALTER TABLE "packages" ALTER COLUMN "paymentMethods" SET NOT NULL;

-- rename goodie name to TOADBAG
UPDATE "goodies" SET "name"='TOTEBAG' WHERE "name" = 'TOADBAG';

-- set the isAutoActivateUserMembership flag to false on the ABO_GIVE abo, leading to voucherCode generation on memberships
ALTER TABLE "packages" ADD COLUMN "isAutoActivateUserMembership" boolean not null default true;
UPDATE "packages" SET "isAutoActivateUserMembership"=false WHERE "name" = 'ABO_GIVE';
