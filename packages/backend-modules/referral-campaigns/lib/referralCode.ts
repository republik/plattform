import type { User, UserRow } from '@orbiting/backend-modules-types'
import type { ReferralCodeRepo } from './repo'
import { CrockfordBase32 } from 'crockford-base32'

const crypto = require('crypto')

const MIN_HASH_LENGTH_IN_BYTES = 5
const MAX_ATTEMPTS_FOR_LENGTH = 10
const MAX_ATTEMPTS = 25

/**
 * Generates and stores a unique code for a user and sets the referral-code for the user.
 * This function will try 25 times to find a new code.
 * @param user
 * @param repo
 * @returns referralCode generated referral code for the user
 */
export async function generateReferralCode(
  user: User,
  repo: ReferralCodeRepo,
  maxAttempts: number = MAX_ATTEMPTS,
): Promise<string | null> {
  let length = MIN_HASH_LENGTH_IN_BYTES
  let attempts = 0

  for (let totalAttempts = 0; totalAttempts < maxAttempts; totalAttempts++) {
    let referralCode: string | null | undefined = randomBase32String(length)
    console.log(
      `User.referralCode | Attempting to assign referralCode ${referralCode} to user ${user.id}`,
    )

    try {
      const updatedUser = await repo.updateUserReferralCode(
        user.id,
        referralCode,
      )
      referralCode = updatedUser?.referralCode
    } catch (err) {
      console.warn(
        `User.referralCode | Could not assign referralCode ${referralCode} to user ${user.id}, trying again...`,
      )
      console.error(err)
      referralCode = null
      attempts++
    }

    if (referralCode) {
      console.log(
        `User.referralCode | Assigned referralCode ${referralCode} to user ${user.id}`,
      )
      return referralCode
    }

    if (attempts < MAX_ATTEMPTS_FOR_LENGTH) {
      attempts++
    } else {
      length++
      attempts = 0
    }
  }

  console.error(
    `Could not generate referral code for user ${user.id}, exceeded max attempts`,
  )

  return null
}

/**
 * Resolves a user based on the referralCode or public username.
 *
 * @param {string} referralCode
 * @param {ReferralCodeRepo} repo
 * @returns {Promise<UserRow?>} generated referral code for the user
 */
export async function resolveUserByReferralCode(
  referralCode: string,
  repo: ReferralCodeRepo,
): Promise<UserRow | null> {
  try {
    const normalizedCode = normalizeReferralCode(referralCode)
    return await repo.getUserByReferralCode(normalizedCode)
  } catch (e) {
    console.log(`REFERRAL_CODE invalid Base32 code ${referralCode}`)
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
