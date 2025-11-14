-- Remove image-specific metadata columns from publikator.files table
ALTER TABLE publikator.files
  DROP COLUMN IF EXISTS "contentType",
  DROP COLUMN IF EXISTS size,
  DROP COLUMN IF EXISTS width,
  DROP COLUMN IF EXISTS height;

