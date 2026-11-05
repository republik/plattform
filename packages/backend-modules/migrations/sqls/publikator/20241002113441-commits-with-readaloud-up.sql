-- migrate up here: CREATE TABLE...

CREATE TABLE "publikator"."commitsWithSynthReadAloud" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "commitId" uuid NOT NULL,
    "derivativeId" uuid NOT NULL,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("commitId"),
    FOREIGN KEY ("commitId") REFERENCES "publikator"."commits"("id") ON DELETE CASCADE,
    FOREIGN KEY ("derivativeId") REFERENCES "publikator"."derivatives"("id")
);
