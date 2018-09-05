CREATE TABLE "previewRequests" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "completedAt" timestamp with time zone
);

CREATE TABLE "previewEvents" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "previewRequestId" uuid NOT NULL REFERENCES "previewRequests"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    event text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now()
);
