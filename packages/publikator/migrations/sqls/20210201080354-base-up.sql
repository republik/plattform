CREATE SCHEMA publikator;

CREATE TABLE publikator.repos (
  id text PRIMARY KEY,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  "currentPhase" text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "archivedAt" timestamp with time zone
);

CREATE TABLE publikator.commits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "repoId" text NOT NULL REFERENCES publikator.repos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  hash text,
  "parentIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "parentHashes" jsonb,
  message text,
  content text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  "userId" uuid REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  author jsonb,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "commits_repoId_hash_idx" ON publikator.commits("repoId" text_ops,hash text_ops);

CREATE TABLE publikator.milestones (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "repoId" text NOT NULL REFERENCES publikator.repos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  scope text NOT NULL DEFAULT 'milestone'::text,
  "commitId" uuid NOT NULL REFERENCES publikator.commits(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  name text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  "userId" uuid REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  author jsonb,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "scheduledAt" timestamp with time zone,
  "publishedAt" timestamp with time zone,
  "revokedAt" timestamp with time zone
);

-- change id::uuid to id::text as publikator.repos.id is text
ALTER TABLE public."notifyTableChangeQueue"
  ALTER COLUMN "id" TYPE text;

-- notify_table_change() executed on INSERT, UPDATE, CHANGE of
-- "publikator.repos"
CREATE TRIGGER trigger_publikator_repos_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON publikator.repos
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();

-- notify_table_change() executed on INSERT, UPDATE, CHANGE of
-- "publikator.commits"
CREATE TRIGGER trigger_publikator_commits_notify_change
  AFTER INSERT OR UPDATE OR DELETE ON publikator.commits
  FOR EACH ROW EXECUTE PROCEDURE notify_table_change();
