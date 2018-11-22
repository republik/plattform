-- SQL stmts to create dummy to test extension feature. Creates a PROLONG
-- package and two options, with membership rewards ABO, BENEFACTOR_ABO.
--
-- @NOTE: Before executing statement, make sure you have a fresh database dump
-- from i.e. production and ran migrations.
--

-- Insert a "PROLONG" crowdfunding phase.
INSERT INTO
  "public"."crowdfundings" (
    "id",
    "name",
    "beginDate",
    "endDate"
  )
VALUES
  (
    E'fb546aaa-09e0-403e-8f42-c6ee2f9b437e',
    E'PROLONG',
    E'2018-11-22 00:00:00+00',
    E'2020-01-15 00:00:00+00'
  )
;

-- Inserts a "PROLONG" package.
INSERT INTO
  "public"."packages" (
    "id",
    "crowdfundingId",
    "name",
    "companyId",
    "paymentMethods",
    "isAutoActivateUserMembership",
    "custom",
    "rules"
  )
VALUES
  (
    E'6b8897bf-7ab4-433c-92a1-64fafcd54417',
    E'fb546aaa-09e0-403e-8f42-c6ee2f9b437e',
    E'PROLONG',
    E'240ef27d-cf26-48c1-81df-54b2a10732f4',
    E'{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}',
    FALSE,
    TRUE,
    '["earlyAdopterBonus"]'
  )
;

-- Insert packageOptions for "PROLONG" package.
INSERT INTO
  "public"."packageOptions" (
    "packageId",
    "rewardId",
    "minAmount",
    "maxAmount",
    "defaultAmount",
    "price",
    "userPrice",
    "minUserPrice",
    "vat"
  )
VALUES
  (
    E'6b8897bf-7ab4-433c-92a1-64fafcd54417',
    E'3837d7e2-8b8e-4e9a-8106-4de5aacedbcd',
    0,
    1,
    0,
    24000,
    TRUE,
    0,
    0
  ),
  (
    E'6b8897bf-7ab4-433c-92a1-64fafcd54417',
    E'5d4ab411-8a26-40dd-8a4f-f59cbfc9503f',
    0,
    1,
    0,
    100000,
    FALSE,
    0,
    0
  )
;
