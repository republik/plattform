import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { claimRewards } from './rewardsHandler'
import { resolveUserByReferralCode } from './referralCode'
import dayjs = require('dayjs')
import { PGReferralsRepo } from './repo'

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
  const repo = new PGReferralsRepo(pgdb)
  debug('payload', payload)
  if (!payload?.referral_campaign) {
    debug('no referral campaign found for referred pledge', pledge?.id)
    return
  }

  const campaign = await repo.getCampaignBySlug(payload.referral_campaign)
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

  if (!payload?.referral_code) {
    // save campaign only referral (phase 2)
    await repo.saveCampaignReferral(campaign.id, pledge.id)
    return
  }

  const referrerId = (
    await resolveUserByReferralCode(payload?.referral_code, repo)
  )?.id
  if (!referrerId) {
    debug('no referrer found for pledge', pledge?.id)
    throw new Error('referrer not found')
  }
  debug('referrer:', referrerId)

  await repo.saveCampaignReferral(campaign.id, pledge.id, referrerId)

  const activeMembership = await pgdb.public.memberships.findOne({
    userId: referrerId,
    active: true,
  })
  // if subscriptionId is not null it is a MONTHLY_ABO
  const hasMonthlyAbo = !!activeMembership?.subscriptionId

  const referralCount =
    (await repo.getUserCampaignReferralCount(campaign.id, referrerId)) || 0
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
    const rewardsToClaim = await repo.getClaimableRewards(
      campaign.id,
      referrerId,
      referralCount,
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
