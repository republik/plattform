const debug = require('debug')('referralCampaigns:lib:referralHandler')
const dayjs = require('dayjs')
const { validate: validateUUID } = require('uuid')
const { findClaimableRewards, claimRewards } = require('./rewardsHandler')
const {
  getPeriodEndingLast,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/utils')

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
  debug('no referrer found for referrerReference', referrerReference)
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
    referralCode: referrerReference,
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
 * @param {{ pgdb: object, mail: object, t: object }}  ctx object containing the pgdb, mail and translations instance
 */
async function handleReferral(pledge, { pgdb, mail, t }) {
  if (!pledge) return
  const { payload } = pledge

  const referrerId = await getUserIdForReferrerReference(
    payload?.ref_content,
    pgdb,
  )

  if (!referrerId) {
    debug('no referrer found for pledge', pledge?.id)
    return
  }

  const campaign = await pgdb.public.campaigns.findOne({
    id: payload?.ref_campaign,
  })

  if (!campaign) {
    debug('no campaign found in payload', payload?.ref_campaign)
    return
  }

  if (
    dayjs(new Date()).isBefore(dayjs(campaign.beginDate)) ||
    dayjs(new Date()).isAfter(dayjs(campaign.endDate))
  ) {
    debug(
      'campaign is not active (too early or too late), campaign is active between',
      campaign.beginDate,
      campaign.endDate,
    )
    return
  }

  const tx = await pgdb.transactionBegin()

  try {
    await tx.public.referrals.insertAndGet({
      pledgeId: pledge.id,
      referrerId: referrerId,
      campaignId: campaign?.id || null,
    })

    await tx.transactionCommit()
  } catch (e) {
    await tx.transactionRollback()
    console.error(e)
    return
  }

  const referralCount = await userReferralCount({ referrerId, campaign }, pgdb)

  const rewardsToClaim = await findClaimableRewards(
    { referrerId, campaign, referralCount },
    pgdb,
  )
  if (!rewardsToClaim || !rewardsToClaim.length) {
    debug(
      'No claimable rewards found for user and campaign',
      referrerId,
      campaign,
    )
    return
  }

  // claim rewards
  // TODO could also be in a scheduler? (if we don't need the info for the mail)
  const claimedPeriods = await claimRewards(
    { referrerId, rewardsToClaim },
    pgdb,
  )

  const newEndDate = getPeriodEndingLast(claimedPeriods)

  const totalCampaignReferrals = await campaignReferralCount(campaign.id, pgdb)

  // send transactional mail to referrer
  const referralMailData = {
    referrerUserId: referrerId,
    pledgeUserId: pledge.user.id,
    referralCount: referralCount,
    withReward: !!claimedPeriods && !!claimedPeriods.length,
    newEndDate: newEndDate,
    totalCampaignReferrals: totalCampaignReferrals,
  }

  await mail.sendReferralCampaignMail({ ...referralMailData }, { pgdb, t })
}

/**
 * Referral count for a specific user and campaign
 * @param {} user
 * @param {} campaign
 * @param pgdb db instance
 * @returns {Promise<number>|null} referral count
 */
async function userReferralCount({ userId, campaign }, pgdb) {
  if (!userId || !campaign) {
    console.error(
      'Both user and campaign are necessary to find user referral count',
    )
    return
  }
  return await pgdb.public.referrals.count({
    referrerId: userId,
    campaignId: campaign.id,
  })
}

/**
 * Referral count for a campaign
 * @param {} campaign
 * @param pgdb db instance
 * @returns {Promise<number>} referral count
 */
async function campaignReferralCount(campaignId, pgdb) {
  if (!campaignId) {
    console.error('Missing campaign id, cannot get referral count')
    return 0
  }
  return await pgdb.public.referrals.count({
    campaignId: campaignId,
  })
}

module.exports = { handleReferral, userReferralCount, campaignReferralCount }
