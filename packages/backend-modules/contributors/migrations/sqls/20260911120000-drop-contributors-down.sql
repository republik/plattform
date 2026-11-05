CREATE TYPE publikator.gender_enum AS ENUM ('m', 'f', 'd', 'na');

CREATE TABLE publikator.contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_bio TEXT,
    bio TEXT,
    image TEXT,
    prolitteris_id TEXT,
    prolitteris_first_name TEXT,
    prolitteris_last_name TEXT,
    gender publikator.gender_enum,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_contributors_prolitteris_ref ON publikator.contributors(prolitteris_id, prolitteris_first_name, prolitteris_last_name) WHERE prolitteris_id IS NOT NULL;
CREATE INDEX idx_contributors_user_id ON publikator.contributors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_contributors_name ON publikator.contributors(name);

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
