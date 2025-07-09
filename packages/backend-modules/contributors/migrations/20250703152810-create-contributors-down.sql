-- Drop the trigger
DROP TRIGGER IF EXISTS update_contributors_updated_at ON contributors;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop the table (this will automatically drop all indexes)
DROP TABLE IF EXISTS contributors;

-- Drop the ENUM types
DROP TYPE IF EXISTS employee_status_enum;
DROP TYPE IF EXISTS gender_enum;