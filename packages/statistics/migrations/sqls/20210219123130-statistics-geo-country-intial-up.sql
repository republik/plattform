CREATE TABLE IF NOT EXISTS "statisticsGeoCountry" (
  "code" citext PRIMARY KEY NOT NULL,
  "name" citext NOT NULL,
  "searchNames" json,
  "lat" FLOAT,
  "lon" FLOAT
);
