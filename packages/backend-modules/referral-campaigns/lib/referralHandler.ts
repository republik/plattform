import type { PgDb } from 'pogi'
import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { findClaimableRewards, claimRewards } from './rewardsHandler'
import { resolveUserByReferralCode } from './referralCode'
import { fetchCampaignBySlug } from './db-queries'
import dayjs = require('dayjs')

const debug = require('debug')('referralCampaigns:lib:referralHandler')

type Pledge = {
  id: string
  userId: string
  payload?: PledgePayload
}

type PledgePayload = {
  referral_code: string | null | undefined
  referral_campaign: string | null | undefined
}

/**
 * Handle a referral for a pledge.
 * @param pledge pledge for which to handle a possible referral
 * @param ctx containing the pgdb, mail and translations instance
 */
export async function handleReferral(
  pledge: Pledge,
  { pgdb, mail, t }: GraphqlContext,
) {
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
    pledgeUserId: pledge.userId,
    referralCount: referralCount,
    hasMonthlyAbo: hasMonthlyAbo,
    noActiveMembership: !activeMembership,
  }

  await mail.sendReferralCampaignMail({ ...referralMailData }, { pgdb, t })

  // rewards can only be claimed if the abo type is not MONTHLY_ABO
  // TODO maybe rewards should still be recorded with a different reward type, tbd
  // TODO this could also move to a scheduler
  if (!hasMonthlyAbo && activeMembership) {
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

type SaveReferralInput = {
  pledgeId: string
  referrerId: string
  campaignId: string
}

export async function saveReferral(
  { pledgeId, referrerId, campaignId }: SaveReferralInput,
  pgdb: PgDb,
) {
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
 */
export async function userReferralCount(
  { userId, campaignId }: { userId: string; campaignId: string },
  pgdb: PgDb,
): Promise<number | null> {
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
 */
export async function campaignReferralCount(
  campaignId: string,
  pgdb: PgDb,
): Promise<number | null> {
  if (!campaignId) {
    console.error('Missing campaign id, cannot get referral count')
    return null
  }
  return await pgdb.public.referrals.count({
    campaignId: campaignId,
  })
}
