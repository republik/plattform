-- Drop the table (this will automatically drop all indexes)
DROP TABLE IF EXISTS publikator.contributors;

-- Drop the ENUM types
DROP TYPE IF EXISTS publikator.gender_enum;
