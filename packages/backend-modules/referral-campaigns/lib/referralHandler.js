const debug = require('debug')('referralCampaigns:lib:referralHandler')
const dayjs = require('dayjs')
const { findClaimableRewards, claimRewards } = require('./rewardsHandler')
const { resolveUserByReferralCode } = require('./referralCode')
const {
  getPeriodEndingLast,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/utils')

/**
 * Handle a referral for a pledge.
 * @param {{
 *  id: string,
 *  payload: {
 *    referral_code: string | null | undefined
 *    referral_campaign: string | null | undefined
 *  }
 * }} pledge for which to handle a possible referral
 * @param {{ pgdb: object, mail: object, t: object }}  ctx object containing the pgdb, mail and translations instance
 */
async function handleReferral(pledge, { pgdb, mail, t }) {
  const { payload } = pledge
  debug('payload', payload)
  if (!payload?.referral_code || !payload?.referral_campaign) {
    debug('no content found for referred pledge', pledge?.id)
    return
  }

  const referrerId = (
    await resolveUserByReferralCode(payload?.referral_code, pgdb)
  )?.id
  if (!referrerId) {
    debug('no referrer found for pledge', pledge?.id)
    throw new Error('referrer not found')
  }
  debug('referrer:', referrerId)

  const campaign = await pgdb.public.campaigns.findOne({
    id: payload?.referral_campaign,
  })

  debug('campaign', campaign)

  if (!campaign) {
    debug('no campaign found in payload', payload?.referral_campaign)
    throw new Error('campaign not found')
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
    throw new Error('campaign is not active')
  }

  const tx = await pgdb.transactionBegin()

  try {
    const newReferral = await tx.public.referrals.insertAndGet({
      pledgeId: pledge.id,
      referrerId: referrerId,
      campaignId: campaign?.id || null,
    })

    await tx.transactionCommit()
    debug('saved referral: ', newReferral)
  } catch (e) {
    await tx.transactionRollback()
    console.error(e)
    return
  }

  const referralCount = await userReferralCount(
    { userId: referrerId, campaign },
    pgdb,
  )
  debug('user referral count: ', referralCount)

  const rewardsToClaim = await findClaimableRewards(
    { userId: referrerId, campaign, referralCount },
    pgdb,
  )
  debug('rewards to claim', rewardsToClaim)
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
    { userId: referrerId, rewards: rewardsToClaim },
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
 * @returns {Promise<number|null>} referral count
 */
async function userReferralCount({ userId, campaign }, pgdb) {
  if (!userId || !campaign) {
    console.error(
      'Both user and campaign are necessary to find user referral count',
    )
    return null
  }
  return await pgdb.public.referrals.count({
    referrerId: userId,
    campaignId: campaign.id,
  })
}

/**
 * Referral count for a campaign
 * @param {string} campaignId
 * @param pgdb db instance
 * @returns {Promise<number|null>} referral count
 */
async function campaignReferralCount(campaignId, pgdb) {
  if (!campaignId) {
    console.error('Missing campaign id, cannot get referral count')
    return null
  }
  return await pgdb.public.referrals.count({
    campaignId: campaignId,
  })
}

module.exports = { handleReferral, userReferralCount, campaignReferralCount }
