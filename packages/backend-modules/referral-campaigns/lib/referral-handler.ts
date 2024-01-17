import debug from 'debug'
import { PgDb } from 'pogi'

type Pledge = {
  id: string
  packageId: string
  userId: string
  payload?: {
    utm_campaign?: string
    utm_content?: string
  }
}

/**
 * Attempt to resolve a user-id based on a possible referrer reference.
 * The ordr of resolution is:
 * 1. if uuid-v4, query users table for user with id
 * 2. check if a user-slug (username field in the users table) exists with that value
 * 3. check if a user-alias exists with that value
 * @param referrerReference user-id, user-slug or user-alias
 * @param pgdb db instance
 * @returns user or null
 */
function getUserForReferrerReference(
  referrerReference: string | undefined | null,
  pgdb: PgDb,
): unknown | null {
  // TODO: 1. if uuid-v4, query users table for user with id
  // TODO: 2. check if a user-slug exists with that value
  // TODO: 3. check if a user-alias exists with that value
  debug('referral-handler')(
    'no referrer found for referrerReference',
    referrerReference,
  )
  return null
}

function getCampaign(
  campaignId: string | undefined | null,
  pgdb: PgDb,
): unknown | null {
  // TODO resolve campaign from campaigns table or null
  debug('referral-handler')('no campaign found for campaignId', campaignId)
  return null
}

type Context = {
  pgdb: PgDb
}

/**
 * Handle a referral for a pledge.
 * @param pledge for which to handle a possible referral
 * @param ctx object containing the pgdb instance
 */
export default function handleReferral(
  pledge: Pledge | undefined | null,
  { pgdb }: Context,
): void {
  if (!pledge) return
  const { payload } = pledge
  const referrer = getUserForReferrerReference(payload?.utm_content, pgdb)

  if (!referrer) {
    debug('referral-handler')('no referrer found for pledge', pledge?.id)
    return
  }

  const campaign = getCampaign(payload?.utm_campaign, pgdb)

  if (!campaign) {
    // TODO. insert referral into referrals table
    debug('referral-handler')('no campaign found for pledge', pledge?.id)
    return
  }

  // TODO: insert referral into referrals table
  //      - handle duplicate referrals
  // TODO: check campaign reward thresholds after insert

  return
}
