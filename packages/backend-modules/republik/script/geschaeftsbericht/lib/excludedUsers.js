// Internal/test/institutional accounts to exclude from all Geschäftsbericht
// counts (memberships, subscriptions, community, gender). These aren't real
// members and would distort the numbers.
//
// The actual user ids are not committed — they identify specific accounts
// and shouldn't live in source control. Set them via an environment
// variable instead (comma-separated uuids), e.g. in your local `.env`:
//
//   GESCHAEFTSBERICHT_EXCLUDED_USER_IDS=uuid1,uuid2,...

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} must be set to run Geschäftsbericht scripts (see lib/excludedUsers.js)`,
    )
  }
  return value
}

const EXCLUDED_USER_IDS = requiredEnv('GESCHAEFTSBERICHT_EXCLUDED_USER_IDS')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

module.exports = { EXCLUDED_USER_IDS }
