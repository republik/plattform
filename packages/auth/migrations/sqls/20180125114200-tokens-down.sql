drop table if exists "tokens";

ALTER TABLE users
  DROP COLUMN "enabledSecondFactors",
  DROP COLUMN "TOTPChallengeSecret",
  DROP COLUMN "isTOTPChallengeSecretVerified",
  DROP COLUMN "phoneNumberVerificationCode",
  DROP COLUMN "isPhoneNumberVerified"
;
