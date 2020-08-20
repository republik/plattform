CREATE TABLE "chargeAttempts" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "membershipId" uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    total integer NOT NULL,
    status text,
    "paymentId" uuid REFERENCES payments(id) ON DELETE CASCADE,
    error jsonb,
    "createdAt" timestamp with time zone DEFAULT now()
) ;

UPDATE "mailLog"
SET type = 'membership_owner_autopay_notice'
WHERE type = 'membership_owner_autopay_notice_5' ;