import type { PgDb } from 'pogi'
import type { CampaignRewardRow, UserCampaignRewardsRow } from './types'

const debug = require('debug')('referralCampaigns:lib:rewardsHandler')
const dayjs = require('dayjs')
const bluebird = require('bluebird')

// TODO get from graphql enum type
const REWARD_TYPES = ['bonus_month']

type FindRewardsInput = {
  userId: string
  campaign: {
    id: string
  }
  referralCount?: number
}

/**
 * Find rewards available to claim for a user and campaign, returns any rewards to claim or null.
 * @param input
 * @param db instance
 * @returns list of available rewards to claim
 */
export async function findClaimableRewards(
  { userId, campaign, referralCount }: FindRewardsInput,
  pgdb: PgDb,
): Promise<CampaignRewardRow[] | undefined> {
  if (!referralCount) {
    // no referrals
    return
  }
  // get relevant campaign rewards
  const rewards: CampaignRewardRow[] = await pgdb.public.campaignRewards.find({
    campaignId: campaign.id,
    '"referralCountThreshold"<=': referralCount,
  })

  if (!rewards || !rewards.length) {
    // no rewards
    return
  }

  // check if user is eligible for reward

  // check if reward has already been claimed
  const rewardIds = rewards.map((reward) => reward.id)
  const claimedRewards: UserCampaignRewardsRow[] =
    await pgdb.public.userCampaignRewards.find({
      userId: userId,
      campaignRewardId: rewardIds,
    })

  const claimedRewardIds = claimedRewards.map((cr) => cr.id)
  const rewardsToClaim = rewards.filter(
    (reward) => !claimedRewardIds.includes(reward.id),
  )

  return rewardsToClaim
}

type ClaimRewardsInput = {
  activeMembership: any
  userId: string
  rewards: CampaignRewardRow[]
}
/**
 * Claim passed rewards for user
 * @param claimRewardsInput
 * @param pgdb db instance
 */
export async function claimRewards(
  { activeMembership, userId, rewards }: ClaimRewardsInput,
  pgdb: PgDb,
): Promise<any> {
  return bluebird.each(rewards, async (reward: CampaignRewardRow) => {
    // consent check would go here

    // check reward type
    if (!REWARD_TYPES.includes(reward.type)) {
      console.error(
        `reward type ${reward.type} not supported, not claiming reward`,
      )
      return
    }

    // generate bonus month
    if (reward.type === 'bonus_month') {
      return await claimBonusMonths({ activeMembership, userId, reward }, pgdb)
    }
  })
}

type ClaimBonusMonthsInput = {
  activeMembership: any
  userId: string
  reward: CampaignRewardRow
}

async function claimBonusMonths(
  { activeMembership, userId, reward }: ClaimBonusMonthsInput,
  pgdb: PgDb,
): Promise<any> {
  const tx = await pgdb.transactionBegin()

  try {
    await tx.public.userCampaignRewards.insert({
      userId: userId,
      campaignRewardId: reward.id,
    })

    const membershipPeriods = await tx.public.membershipPeriods.find({
      membershipId: activeMembership.id,
    })

    const lastPeriod = getPeriodEndingLast(membershipPeriods)
    const endDate = dayjs(lastPeriod.endDate)

    const newMembershipPeriod = await tx.public.membershipPeriods.insertAndGet({
      membershipId: activeMembership.id,
      beginDate: endDate,
      endDate: endDate.add(reward.amount, 'month'),
      kind: 'BONUS',
    })
    await tx.transactionCommit()
    debug(newMembershipPeriod)

    return newMembershipPeriod
  } catch (e) {
    console.error('transaction rollback, not claiming bonus month', e)
    await tx.transactionRollback()
  }
}

// vendord from republik-crowdfundings/lib/utils because it is not exported
// correctly and would cause circular dependencies
// Finds latest period in a series of membershipPeriods
export function getPeriodEndingLast(periods: any[]) {
  return periods
    .map((p) => p)
    .reduce((accumulator, currentValue) => {
      if (!accumulator) {
        return currentValue
      }

      return currentValue.endDate > accumulator.endDate
        ? currentValue
        : accumulator
    }, false)
}
