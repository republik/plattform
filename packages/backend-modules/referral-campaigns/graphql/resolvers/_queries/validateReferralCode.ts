import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { resolveUserByReferralCode } from '../../../lib/referralCode'

type ValidateReferralArgs = { code: string }

type ValidationResult = 'OK' | 'NOT_FOUND' | 'IS_OWN'

/**
 * Checks if the provided referral code is valid.
 */
export = async function validateReferralCode(
  _: any,
  { code }: ValidateReferralArgs,
  { user: me, pgdb }: GraphqlContext,
): Promise<ValidationResult> {
  const user = await resolveUserByReferralCode(code, pgdb)
  if (!user) {
    return 'NOT_FOUND'
  }

  if (me && me.id === user.id) {
    return 'IS_OWN'
  }

  return 'OK'
}
