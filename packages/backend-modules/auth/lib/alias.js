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
 * Generates and stores a unique alias for a user and updates the user with the alias.
 * @param {object} user
 * @param {object} pgdb
 * @returns {Promise<string>} generated alias for the user
 */
async function generateUserAlias(user, pgdb) {
  if (user.alias) {
    return user.alias
  }

  // create sha256 hash of user.id + timestamp
  let alias
  let length = MIN_HASH_LENGTH
  let attempts = 0
  let totalAttempts = 0

  while (!alias) {
    alias = randomString(length)
    console.log(
      `User.alias | Attempting to assign alias ${alias} to user ${user.id}`,
    )

    await pgdb.public.users
      .updateAndGetOne({ id: user.id }, { alias })
      .then((user) => {
        alias = user.alias
        console.log(`User.alias | Assigned alias ${alias} to user ${user.id}`)
      })
      // in case of collision, try again
      .catch((err) => {
        console.error(
          `User.alias | Could not assign alias ${alias} to user ${user.id}, trying again...`,
        )
        console.error(err)
        alias = null
        attempts++
      })

    if (alias) {
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
      throw new Error('Could not generate alias')
    }
  }

  return alias
}

module.exports = {
  generateUserAlias,
}
