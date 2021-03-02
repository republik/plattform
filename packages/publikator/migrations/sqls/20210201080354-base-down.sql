DROP TRIGGER IF EXISTS trigger_publikator_commits_notify_change
  ON publikator.commits;
DROP TRIGGER IF EXISTS trigger_publikator_repos_notify_change
  ON publikator.repos;
TRUNCATE public."notifyTableChangeQueue";
ALTER TABLE public."notifyTableChangeQueue"
  ALTER COLUMN "id" TYPE uuid USING id::uuid;
DROP TABLE publikator.milestones;
DROP TABLE publikator.commits;
DROP TABLE publikator.repos;
DROP SCHEMA publikator;
