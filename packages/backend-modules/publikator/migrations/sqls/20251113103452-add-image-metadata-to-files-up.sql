-- Add image-specific metadata columns to publikator.files table
ALTER TABLE publikator.files
  ADD COLUMN "contentType" text,
  ADD COLUMN size integer,
  ADD COLUMN width integer,
  ADD COLUMN height integer;

