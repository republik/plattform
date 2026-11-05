CREATE INDEX IF NOT EXISTS commits_repo_created_at_idx ON publikator.commits("repoId", "createdAt" DESC);
