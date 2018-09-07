CREATE TABLE "previewRequests" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "scheduledAt" timestamp with time zone,
    "expiredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "previewEvents" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "previewRequestId" uuid NOT NULL REFERENCES "previewRequests"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    event text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now()
);
