-- migrate down here: DROP TABLE...
ALTER TABLE users
  ADD COLUMN "TOTPChallengeSecret"            text,
  ADD COLUMN "isTOTPChallengeSecretVerified"  boolean not null default false,
  ADD COLUMN "phoneNumberVerificationCode"    text,
  ADD COLUMN "isPhoneNumberVerified"          boolean not null default false,
;
