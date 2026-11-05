CREATE DOMAIN "filesStatusDomain" AS TEXT
  CONSTRAINT "filesStatusDomainCheck"
    CHECK(
      VALUE IN (
        'Pending',
        'Failure',
        'Private',
        'Public',
        'Destroyed'
      )
    );

CREATE TABLE publikator.files (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "repoId" text NOT NULL REFERENCES publikator.repos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name citext NOT NULL,
  status "filesStatusDomain" NOT NULL DEFAULT 'Pending'::text::"filesStatusDomain",
  error text,
  "userId" uuid REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  author jsonb,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "readyAt" timestamp with time zone,
  "failedAt" timestamp with time zone,
  "destroyedAt" timestamp with time zone
);

CREATE INDEX "files_repoId_idx" ON publikator.files("repoId" text_ops);
