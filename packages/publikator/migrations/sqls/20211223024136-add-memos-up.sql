CREATE TABLE "publikator"."memos" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "repoId" text NOT NULL,
    "parentIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "text" text NOT NULL,
    "userId" uuid,
    "author" jsonb,
    "published" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("repoId") REFERENCES "publikator"."repos"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
