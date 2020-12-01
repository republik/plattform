alter table "postfinanceImports"
add column "buffer" bytea not null,
add column "isImported" boolean not null default false;
