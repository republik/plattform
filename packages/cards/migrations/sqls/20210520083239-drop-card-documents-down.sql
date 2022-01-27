CREATE TABLE "cardDocuments" (
  id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
  "cardId" uuid NOT NULL REFERENCES "cards" (id) ON DELETE CASCADE,
  "repoId" text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

