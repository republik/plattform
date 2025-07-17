CREATE TYPE gender_enum AS ENUM ('m', 'f', 'd', 'na');

CREATE TABLE contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_bio TEXT,
    bio TEXT,
    image TEXT,
    prolitteris_id TEXT,
    prolitteris_first_name TEXT,
    prolitteris_last_name TEXT,
    gender gender_enum,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_contributors_prolitteris_ref ON contributors(prolitteris_id, prolitteris_first_name, prolitteris_last_name) WHERE prolitteris_id IS NOT NULL;
CREATE INDEX idx_contributors_user_id ON contributors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_contributors_name ON contributors(name);
