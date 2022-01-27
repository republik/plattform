ALTER TABLE "electionCandidacies"
  ADD COLUMN "credentialId" uuid references "credentials" on update cascade on delete cascade
;
