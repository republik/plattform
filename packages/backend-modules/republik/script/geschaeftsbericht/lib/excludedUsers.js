// Internal/test/institutional accounts to exclude from all Geschäftsbericht
// counts (memberships, subscriptions, community, gender). These aren't real
// members and would distort the numbers.
//
// The actual user ids are not committed — they identify specific accounts
// and shouldn't live in source control. Set them via environment variables
// instead, e.g. in your local `.env`:
//
//   GESCHAEFTSBERICHT_EXCLUDED_USER_IDS=uuid1,uuid2,...
//   GESCHAEFTSBERICHT_TOMBSTONE_USER_ID=uuid1
//
// GESCHAEFTSBERICHT_TOMBSTONE_USER_ID should be one of the ids already
// listed in GESCHAEFTSBERICHT_EXCLUDED_USER_IDS — see diagnoseCockpitGap.js
// for why it's needed separately.

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be set to run Geschäftsbericht scripts`)
  }
  return value
}

const EXCLUDED_USER_IDS = requiredEnv('GESCHAEFTSBERICHT_EXCLUDED_USER_IDS')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

const TOMBSTONE_USER_ID = requiredEnv('GESCHAEFTSBERICHT_TOMBSTONE_USER_ID')

module.exports = { EXCLUDED_USER_IDS, TOMBSTONE_USER_ID }
