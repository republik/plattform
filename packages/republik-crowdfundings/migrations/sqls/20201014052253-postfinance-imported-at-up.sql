alter table "postfinanceImports"
add column "importedAt" timestamptz,
add constraint "postfinanceImports_importedAt_not_null_if_isImported_false"
CHECK (
  ("isImported" = false) OR ("importedAt" IS NOT NULL and "isImported" = true)
);
