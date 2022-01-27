CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create table "votings" (
  "id"                    uuid primary key not null default uuid_generate_v4(),
  "name"                  text not null,
  "beginDate"             timestamptz not null,
  "endDate"               timestamptz not null,
  "result"                jsonb,
  "createdAt"             timestamptz default now(),
  "updatedAt"             timestamptz default now(),
  unique("id", "name")
);
create index "votings_result_idx" ON "votings" using GIN ("result");

create table "votingOptions" (
  "id"                    uuid primary key not null default uuid_generate_v4(),
  "votingId"              uuid not null references "votings" on update cascade on delete cascade,
  "name"                  text not null,
  "createdAt"             timestamptz default now(),
  "updatedAt"             timestamptz default now(),
  unique("votingId", "name")
);

create table "ballots" (
  "id"                    uuid primary key not null default uuid_generate_v4(),
  "votingId"              uuid not null references "votings" on update cascade on delete cascade,
  "votingOptionId"        uuid not null references "votingOptions" on update cascade on delete cascade,
  "userId"                uuid not null references "users" on update cascade on delete cascade,
  "createdAt"             timestamptz default now(),
  "updatedAt"             timestamptz default now(),
  unique("votingId", "userId")
);


CREATE FUNCTION check_ballot_trg() RETURNS trigger AS $$
BEGIN
  IF (SELECT "votingId" FROM "votingOptions" WHERE id = NEW."votingOptionId") != NEW."votingId" THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: claimed votingId != votingOption.votingId';
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_ballot
BEFORE INSERT ON ballots
FOR EACH ROW
EXECUTE PROCEDURE check_ballot_trg();
