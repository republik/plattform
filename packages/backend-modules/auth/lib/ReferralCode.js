const crypto = require('crypto')

const NON_URL_SAFE_BASE64_CHARS = ['+', '/', '=']

/**
 * Create a random string of letters of a given length.
 * @param {number} length
 * @returns {string} base64 encoded sha256 hash
 */
function randomString(length) {
  // const randId = uuidv4()
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(new RegExp(`[${NON_URL_SAFE_BASE64_CHARS.join('')}]`, 'g'), '')
}

const HASH_LENGTH_ATTEMPTS = 10
const MIN_HASH_LENGTH = 6
const MAX_ATTMEPTS = 25

/**
 * Generates and stores a unique code for a user and sets the referral-code for the user.
 * @param {object} user
 * @param {object} pgdb
 * @returns {Promise<string>} generated alias for the user
 */
async function generateReferralCode(user, pgdb) {
  if (user.referralCode) {
    return user.referralCode
  }

  // create sha256 hash of user.id + timestamp
  let referralCode
  let length = MIN_HASH_LENGTH
  let attempts = 0
  let totalAttempts = 0

  while (!referralCode) {
    referralCode = randomString(length)
    console.log(
      `User.referralCode | Attempting to assign referralCode ${referralCode} to user ${user.id}`,
    )

    await pgdb.public.users
      .updateAndGetOne({ id: user.id }, { referralCode: referralCode })
      .then((user) => {
        referralCode = user.referralCode
        console.log(
          `User.referralCode | Assigned referralCode ${referralCode} to user ${user.id}`,
        )
      })
      // in case of collision, try again
      .catch((err) => {
        console.error(
          `User.referralCode | Could not assign referralCode ${referralCode} to user ${user.id}, trying again...`,
        )
        console.error(err)
        referralCode = null
        attempts++
      })

    if (referralCode) {
      break
    }

    if (attempts < HASH_LENGTH_ATTEMPTS) {
      attempts++
    } else {
      length++
      attempts = 0
    }
    totalAttempts++

    if (totalAttempts > MAX_ATTMEPTS) {
      console.error(
        `Could not generate referral code for user ${user.id}, exceeded max attempts`,
      )
      referralCode = null
      break
    }
  }

  return referralCode
}

module.exports = {
  generateReferralCode,
}
