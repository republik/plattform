CREATE DOMAIN "derivativesTypeDomain" AS TEXT
  CONSTRAINT "derivativesTypeDomainCheck"
    CHECK(
      VALUE IN (
        'SyntheticReadAloud'
      )
    );

CREATE DOMAIN "derivativesStatusDomain" AS TEXT
  CONSTRAINT "derivativesStatusDomainCheck"
    CHECK(
      VALUE IN (
        'Pending',
        'Ready',
        'Failure',
        'Destroyed'
      )
    );

CREATE TABLE "publikator"."derivatives" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "commitId" uuid,
    "type" "derivativesTypeDomain" NOT NULL DEFAULT 'milestone'::"derivativesTypeDomain",
    "status" "derivativesStatusDomain" NOT NULL DEFAULT 'milestone'::"derivativesStatusDomain",
    "result" jsonb,
    "userId" uuid REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    author jsonb,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "readyAt" timestamp with time zone,
    "failedAt" timestamp with time zone,
    "destroyedAt" timestamp with time zone,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("commitId") REFERENCES "publikator"."commits"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
