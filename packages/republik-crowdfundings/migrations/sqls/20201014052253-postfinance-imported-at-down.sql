alter table "postfinanceImports"
drop constraint "postfinanceImports_importedAt_not_null_if_isImported_false",
drop "importedAt";
