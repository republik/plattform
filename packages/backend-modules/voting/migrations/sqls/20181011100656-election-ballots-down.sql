--ALTER TABLE "votingBallots"
--  RENAME TO "ballots"
--;

drop trigger if exists check_election_ballot ON "electionBallots";
drop function if exists check_election_ballot_trg();
drop table if exists "electionBallots";
