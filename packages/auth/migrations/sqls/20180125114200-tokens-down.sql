drop table if exists "tokens";

ALTER TABLE users
  DROP COLUMN "isTwoFactorEnabled",
  DROP COLUMN "TOTPChallengeSecret",
  DROP COLUMN "isTOTPChallengeSecretVerified",
  DROP COLUMN "smsChallengeSecret",
  DROP COLUMN "isSMSChallengeSecretVerified"
;
