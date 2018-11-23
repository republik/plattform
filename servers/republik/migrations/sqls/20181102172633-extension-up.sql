ALTER TABLE "packages"
  -- A boolean, declaring whether a package is "custom" to a user and is treated
  -- differently in code.
  ADD COLUMN "custom" boolean NOT NULL DEFAULT false,

  -- An array of "rules" a package and its options must adhere.
  ADD COLUMN "rules" jsonb NOT NULL DEFAULT '[]'::jsonb
;

ALTER TABLE "memberships"
  ADD COLUMN "autoPay" boolean NOT NULL DEFAULT false
;

ALTER TABLE "membershipPeriods"
  -- Describes which pledge let to the generation if this period.
  ADD COLUMN "pledgeId" uuid,
  ADD FOREIGN KEY ("pledgeId")
    REFERENCES "public"."pledges"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  -- To distinguish regular periods from bonus or admin periods
  ADD COLUMN "kind" character varying
    NOT NULL
    DEFAULT 'REGULAR'::character varying
;

ALTER TABLE "pledgeOptions"
  -- Release (primary key) constraint in favour of an "id" as a primary key.
  DROP CONSTRAINT "pledgeOptions_pkey",

  -- Add primary key row
  ADD COLUMN "id" uuid
    DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY ("id"),

  ADD COLUMN "membershipId" uuid,
  ADD FOREIGN KEY ("membershipId")
    REFERENCES "public"."memberships"("id"),

  ADD COLUMN "autoPay" boolean
;
