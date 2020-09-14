create table "postfinanceImports" (
  "fileName" varchar not null,
  "createdAt" timestamptz NOT NULL default now()
);

create index "postfinanceImports_fileName" on "postfinanceImports"("fileName");
