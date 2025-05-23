-- migrate up here: CREATE TABLE...
ALTER TABLE users
  DROP COLUMN IF EXISTS "TOTPChallengeSecret",
  DROP COLUMN IF EXISTS "isTOTPChallengeSecretVerified",
  DROP COLUMN IF EXISTS "phoneNumberVerificationCode",
  DROP COLUMN IF EXISTS "isPhoneNumberVerified"
;
