drop trigger if exists check_ballot ON ballots;
drop function if exists check_ballot_trg();
drop index if exists "votings_result_idx";
drop table if exists "ballots";
drop table if exists "votingOptions";
drop table if exists "votings";
