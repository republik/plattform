CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table if not exists "elections" (
  "id"           uuid primary key not null default uuid_generate_v4(),
  "slug"         varchar          not null,
  "description"  varchar          not null,
  "beginDate"    timestamptz      not null,
  "endDate"      timestamptz      not null,
  "numSeats"     integer          not null,
  "discussionId" uuid             not null references "discussions", -- no cascade to preserve voting record
  "result"       jsonb,
  "createdAt"    timestamptz               default now(),
  "updatedAt"    timestamptz               default now(),
  unique ("id", "slug")
);

create table if not exists "electionCandidacies" (
  "id"             uuid primary key not null default uuid_generate_v4(),
  "userId"         uuid             not null references "users", -- no cascade to preserve voting record
  "electionId"     uuid             not null references "elections" on update cascade on delete cascade,
  "commentId"      uuid             not null references "comments",
  "recommendation" varchar,
  "createdAt"      timestamptz               default now(),
  "updatedAt"      timestamptz               default now()
);

create table if not exists "electionBallots" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "userId"      uuid             not null references "users", -- no cascade to preserve voting record
  "candidacyId" uuid             not null references "electionCandidacies", -- no cascade to preserve voting record
  "createdAt"   timestamptz               default now(),
  "updatedAt"   timestamptz               default now()
);

CREATE OR REPLACE FUNCTION refresh_associate_role(user_id uuid)
  RETURNS void AS $$
DECLARE
  _active boolean;
  _role text := 'associate';
BEGIN
  SELECT
         COALESCE(bool_or(active), false) INTO _active
  FROM
       memberships m
         JOIN
           users u
           ON m."userId"=u.id
         JOIN
           "membershipTypes" mt
           ON mt.id = m."membershipTypeId"
  WHERE
      u.id = user_id AND (mt.name = 'ABO' OR mt.name = 'BENEFACTOR_ABO');

  IF _active = true THEN
    PERFORM add_user_to_role(user_id, _role);
  ELSE
    PERFORM remove_user_from_role(user_id, _role);
  END IF;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION refresh_associate_role_trigger_function()
  RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM refresh_associate_role(NEW."userId");
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM refresh_associate_role(NEW."userId");
    PERFORM refresh_associate_role(OLD."userId");
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM refresh_associate_role(OLD."userId");
    RETURN OLD;
  END IF;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_associate_role
  AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW
EXECUTE PROCEDURE refresh_associate_role_trigger_function();


# Run once for all users
SELECT refresh_associate_role(id) FROM users;

