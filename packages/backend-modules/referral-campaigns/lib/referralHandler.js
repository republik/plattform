const debug = require('debug')('referralCampaigns:lib:referralHandler')
const dayjs = require('dayjs')
const { findClaimableRewards, claimRewards } = require('./rewardsHandler')
const { resolveUserByReferralCode } = require('./referralCode')
const { fetchCampaignBySlug } = require('./db-queries')

/**
 * Handle a referral for a pledge.
 * @param {{
 *  id: string,
 *  payload?: {
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

  const campaign = await fetchCampaignBySlug(payload.referral_campaign, pgdb)

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

  await saveReferral(
    { pledgeId: pledge.id, referrerId: referrerId, campaignId: campaign?.id },
    pgdb,
  )

  const activeMembership = await pgdb.public.memberships.findOne({
    userId: referrerId,
    active: true,
  })
  // if subscriptionId is not null it is a MONTHLY_ABO
  const hasMonthlyAbo = !!activeMembership?.subscriptionId

  const referralCount =
    (await userReferralCount(
      { userId: referrerId, campaignId: campaign.id },
      pgdb,
    )) || 0
  debug('user referral count: ', referralCount)

  // send transactional mail to referrer
  const referralMailData = {
    referrerUserId: referrerId,
    pledgeUserId: pledge.user.id,
    referralCount: referralCount,
    hasMonthlyAbo: hasMonthlyAbo,
    noActiveMembership: !activeMembership,
  }

  await mail.sendReferralCampaignMail({ ...referralMailData }, { pgdb, t })

  // rewards can only be claimed if the abo type is not MONTHLY_ABO
  // TODO maybe rewards should still be recorded with a different reward type, tbd
  // TODO this could also move to a scheduler
  if (!hasMonthlyAbo) {
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
    await claimRewards(
      {
        activeMembership: activeMembership,
        userId: referrerId,
        rewards: rewardsToClaim,
      },
      pgdb,
    )
  }
}

async function saveReferral({ pledgeId, referrerId, campaignId }, pgdb) {
  const tx = await pgdb.transactionBegin()
  try {
    const newReferral = await tx.public.referrals.insertAndGet({
      pledgeId: pledgeId,
      referrerId: referrerId,
      campaignId: campaignId || null,
    })

    await tx.transactionCommit()
    debug('saved referral: ', newReferral)
  } catch (e) {
    await tx.transactionRollback()
    console.error(e)
  }
}

/**
 * Referral count for a specific user and campaign
 * @param {{userId: string, campaignId: string}} input
 * @param pgdb db instance
 * @returns {Promise<number|null>} referral count
 */
async function userReferralCount({ userId, campaignId }, pgdb) {
  if (!userId || !campaignId) {
    console.error(
      'Both userId and campaignId are necessary to find user referral count',
    )
    return null
  }
  return await pgdb.public.referrals.count({
    referrerId: userId,
    campaignId: campaignId,
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
