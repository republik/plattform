-- migrate up here: CREATE TABLE...

CREATE TABLE "public"."paymentErrors" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with timezone DEFAULT now(),
    "method" text,
    "step" text,
    "error" text,
    "payload" jsonb,
    "args" jsonb,
    PRIMARY KEY ("id")
);
