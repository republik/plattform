CREATE TABLE "mailchimpLog" (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text,
  "firedAt" timestamp with time zone DEFAULT now(),
  email citext,
  campaign text,
  action text,
  reason text,
  customer jsonb,
  newsletter jsonb,
  "oldEmail" citext,
  "createdAt" timestamp with time zone DEFAULT now()
)
