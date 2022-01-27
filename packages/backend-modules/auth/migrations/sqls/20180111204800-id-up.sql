ALTER TABLE sessions ADD COLUMN id uuid not null unique DEFAULT uuid_generate_v4();
