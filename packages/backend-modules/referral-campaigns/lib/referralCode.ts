import type { User, UserRow } from '@orbiting/backend-modules-types'
import type { PgDb } from 'pogi'
import { CrockfordBase32 } from 'crockford-base32'

const crypto = require('crypto')

const HASH_LENGTH_ATTEMPTS = 10
const MIN_HASH_LENGTH_IN_BYTES = 5
const MAX_ATTMEPTS = 25

/**
 * Generates and stores a unique code for a user and sets the referral-code for the user.
 * @param {User} user
 * @param {PgDb} pgdb
 * @returns {Promise<string|null>} generated referral code for the user
 */
export async function generateReferralCode(user: User, pgdb: PgDb) {
  if (user.referralCode) {
    return user.referralCode
  }

  let referralCode: string | null | undefined
  let length = MIN_HASH_LENGTH_IN_BYTES
  let attempts = 0
  let totalAttempts = 0

  while (!referralCode) {
    referralCode = randomBase32String(length)
    console.log(
      `User.referralCode | Attempting to assign referralCode ${referralCode} to user ${user.id}`,
    )

    await pgdb.public.users
      .updateAndGetOne({ id: user.id }, { referralCode: referralCode })
      .then((user: UserRow) => {
        referralCode = user.referralCode
        console.log(
          `User.referralCode | Assigned referralCode ${referralCode} to user ${user.id}`,
        )
      })
      // in case of collision, try again
      .catch((err: Error) => {
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

/**
 * Resolves a user based on the referralCode or public username.
 *
 * @param {string} referral
 * @param {PgDb} pgdb
 * @returns {Promise<UserRow?>} generated referral code for the user
 */
export async function resolveUserByReferralCode(referral: string, pgdb: PgDb) {
  try {
    const normalizedCode = normalizeReferralCode(referral)
    return await pgdb.public.users.findOne({
      referralCode: normalizedCode,
    })
  } catch (e) {
    console.log(`REFERRAL_CODE invalid Base32 code ${referral}`)
  }
  return null
}

/**
 * Create a random string of letters of a given length.
 * @param {number} length
 * @returns {string} crockford base32 encoded string
 */
function randomBase32String(length: number) {
  return CrockfordBase32.encode(crypto.randomBytes(length))
}

/**
 * Normalize Base32 representation
 * @param {string} code
 * @returns {string} crockford base32 encoded string
 */
function normalizeReferralCode(code: string) {
  // Reencode the referral code with Corockford-Base32 to get rid of "- O U L I"
  return CrockfordBase32.encode(CrockfordBase32.decode(code))
}

/**
 * Returns a new dash-separated string based on input string and partition size.
 *
 * `formatAsDashSeperated("AAAABBBB", 4) // AAAA-BBBB`
 *
 * @param {string} inputString String to be formated
 * @param {number} partitionSize Size of each dash separated block
 * @returns {String}
 */
export function formatAsDashSeperated(
  inputString: string,
  partitionSize: number,
) {
  let formatted = ''
  for (let i = 0; i < inputString.length; i++) {
    formatted += inputString[i]
    if ((i + 1) % partitionSize === 0 && i !== inputString.length - 1) {
      formatted += '-'
    }
  }
  return formatted
}
