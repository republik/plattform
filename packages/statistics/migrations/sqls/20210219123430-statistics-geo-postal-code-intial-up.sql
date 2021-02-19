CREATE TABLE IF NOT EXISTS "statisticsGeoPostalCode" (
  "countryCode" citext NOT NULL REFERENCES "statisticsGeoCountry" ON UPDATE CASCADE ON DELETE CASCADE,
  "postalCode" text NOT NULL,
  "lat" FLOAT,
  "lon" FLOAT,
  PRIMARY KEY ("countryCode", "postalCode")
);
