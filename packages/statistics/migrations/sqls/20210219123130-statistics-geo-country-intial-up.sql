CREATE TABLE IF NOT EXISTS "statisticsGeoCountry" (
  "code" citext PRIMARY KEY NOT NULL,
  "name" citext NOT NULL,
  "searchNames" jsonb,
  "lat" float,
  "lon" float
);
