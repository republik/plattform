CREATE TABLE calendars (
  slug citext PRIMARY KEY,
  "limitRoles" jsonb,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "calendarSlots" (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "calendarSlug" citext NOT NULL REFERENCES calendars(slug) ON DELETE RESTRICT ON UPDATE CASCADE,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  key text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "revokedAt" timestamp with time zone
);
