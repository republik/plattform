ALTER TABLE "discussionPreferences"
  ADD COLUMN "id" uuid unique not null default uuid_generate_v4()
;
