-- migrate up here: CREATE TABLE...

CREATE TABLE "publikator"."repoContributors" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "repoId" text NOT NULL,
    "contributorId" uuid NOT NULL,
    "kind" text NOT NULL, -- this could also be an enum, but I think text is better
    "displayText" text,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("repoId") REFERENCES "publikator"."repos"("id"),
    FOREIGN KEY ("contributorId") REFERENCES "publikator"."contributors"("id")
) TABLESPACE "pg_default";

CREATE UNIQUE INDEX idx_repo_contributor_kind ON publikator."repoContributors"("repoId", "contributorId", "kind");
