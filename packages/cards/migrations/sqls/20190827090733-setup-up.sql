CREATE TABLE "cardGroups" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    "disucussionId" uuid REFERENCES discussions(id) ON DELETE SET NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "cards" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    weight real NOT NULL DEFAULT '0'::real,
    "cardGroupId" uuid NOT NULL REFERENCES "cardGroups"(id) ON DELETE CASCADE,
    "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "cardDocuments" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "cardId" uuid NOT NULL REFERENCES "cards"(id) ON DELETE CASCADE,
    "repoId" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);
