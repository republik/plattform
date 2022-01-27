ALTER TABLE "questionnaires"
  ADD COLUMN "unattributedAnswers" boolean not null default false
;

ALTER TABLE "answers"
  ADD COLUMN "unattributed" boolean not null default false
;
