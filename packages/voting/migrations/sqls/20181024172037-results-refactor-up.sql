ALTER TABLE "votings"
  ADD COLUMN "liveResult" boolean not null default false
;

ALTER TABLE "elections"
  ADD COLUMN "liveResult" boolean not null default false
;

ALTER TABLE "questionnaires"
  ADD COLUMN "liveResult" boolean not null default false
;
