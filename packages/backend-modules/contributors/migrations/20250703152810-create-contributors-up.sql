CREATE TYPE gender_enum AS ENUM ('m', 'f', 'd');
CREATE TYPE employee_status_enum AS ENUM ('past', 'present');

CREATE TABLE contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_bio TEXT,
    image TEXT,
    prolitteris_id TEXT UNIQUE,
    prolitteris_name TEXT,
    gender gender_enum,
    user_id UUID REFERENCES users(id),
    employee_status employee_status_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contributors_slug ON contributors(slug);
CREATE INDEX idx_contributors_prolitteris_id ON contributors(prolitteris_id) WHERE prolitteris_id IS NOT NULL;
CREATE INDEX idx_contributors_user_id ON contributors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_contributors_name ON contributors(name);

-- Add a trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contributors_updated_at 
    BEFORE UPDATE ON contributors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
