const debug = require('debug')
const { validate: validateUUID } = require('uuid')

/**
 * Attempt to resolve a user-id based on a possible referrer reference.
 * The ordr of resolution is:
 * 1. if uuid-v4, query users table for user with id
 * 2. check if a user-slug (username field in the users table) exists with that value
 * 3. check if a user-alias exists with that value
 * @param {string|null|undefined}referrerReference user-id, user-slug or user-alias
 * @param pgdb db instance
 * @returns {Promise<string|null>} user-id or null
 */
async function getUserIdForReferrerReference(referrerReference, pgdb) {
  // TODO: 1. if uuid-v4, query users table for user with id
  // TODO: 2. check if a user-slug exists with that value
  // TODO: 3. check if a user-alias exists with that value
  debug('referral-handler')(
    'no referrer found for referrerReference',
    referrerReference,
  )
  if (!referrerReference) {
    return null
  }

  // check is uuid-v4
  if (validateUUID(referrerReference)) {
    // validate user with id exists
    const user = await pgdb.public.users.findOne({
      id: referrerReference,
    })

    return user?.id || null
  }

  // check if user-slug exists
  let user = await pgdb.public.users.findOne({
    username: referrerReference,
  })
  if (user) {
    return user?.id || null
  }

  // check if user-alias exists
  user = await pgdb.public.users.findOne({
    alias: referrerReference,
  })

  return user?.id || null
}

/**
 * Handle a referral for a pledge.
 * @param {{
 *  id: string,
 *  payload: {
 *    ref_content: string | null | undefined
 *    ref_campaign: string | null | undefined
 *  }
 * }} pledge for which to handle a possible referral
 * @param {{ pgdb: object }}  ctx object containing the pgdb instance
 */
async function handleReferral(pledge, { pgdb }) {
  if (!pledge) return
  const { payload } = pledge

  const referrerId = await getUserIdForReferrerReference(
    payload?.ref_content,
    pgdb,
  )

  if (!referrerId) {
    debug('referral-handler')('no referrer found for pledge', pledge?.id)
    return
  }

  const campaign = await pgdb.public.campaigns.findOne({
    id: payload?.ref_campaign,
  })

  await pgdb.transactionBegin()

  try {
    await pgdb.public.referrals.insertAndGet({
      pledgeId: pledge.id,
      referrerId: referrerId,
      campaignId: campaign?.id || null,
    })

    await pgdb.transactionCommit()
  } catch (e) {
    await pgdb.transactionRollback()
    console.error(e)
  }

  // TODO: check campaign reward thresholds after insert
}

module.exports = handleReferral
