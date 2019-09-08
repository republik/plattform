ALTER TABLE "questionnaires"
  ADD COLUMN "immutableAnswers" boolean not null default false,
  ADD COLUMN "submitAnswersImmediately" boolean not null default false,
  ADD COLUMN "updateResultIncrementally" boolean not null default false,
  ADD COLUMN "noEmptyAnswers" boolean not null default false
;
