--ALTER TABLE "ballots"
--  RENAME TO "votingBallots"
--;

DROP TABLE IF EXISTS "electionBallots";

CREATE TABLE "electionBallots" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "electionId"    uuid NOT NULL REFERENCES "elections" ON UPDATE CASCADE ON DELETE CASCADE,
  "candidacyId"   uuid REFERENCES "electionCandidacies" ON UPDATE CASCADE ON DELETE CASCADE,
  "userId"        uuid NOT NULL REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now(),
  unique("candidacyId", "userId")
);


CREATE FUNCTION check_election_ballot_trg() RETURNS trigger AS $$
BEGIN
  IF (SELECT "electionId" FROM "electionCandidacies" WHERE id = NEW."candidacyId") != NEW."electionId" THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: claimed electionId != candidacyId.electionId';
  END IF;
  IF (SELECT COUNT(*) FROM "electionBallots" WHERE "electionId"=NEW."electionId" AND "userId" = NEW."userId") >= (SELECT "numSeats" FROM "elections" WHERE "id"=NEW."electionId") THEN
    RAISE EXCEPTION 'PSQL EXCEPTION: no more ballots left for user for this election';
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_election_ballot
BEFORE INSERT ON "electionBallots"
FOR EACH ROW
EXECUTE PROCEDURE check_election_ballot_trg();
