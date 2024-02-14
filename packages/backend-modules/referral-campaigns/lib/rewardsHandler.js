const debug = require('debug')('referralCampaigns:lib:rewardsHandler')
const dayjs = require('dayjs')
const bluebird = require('bluebird')

const {
  getPeriodEndingLast,
} = require('../../republik-crowdfundings/lib/utils')
// TODO get from graphql enum type
const REWARD_TYPES = ['bonus_month']

/** @typedef {import("pogi").PgDb} PgDb */
/** @typedef {{ userId: string, campaign: object, referralCount?: number }} FindRewardsInput */
/** @typedef {{ userId: string, rewards: Array<any> }} ClaimRewardsInput */

/**
 * Find rewards available to claim for a user and campaign, returns any rewards to claim or null.
 * @param {FindRewardsInput} input
 * @param {PgDb} pgdb db instance
 * @returns {Promise<any>} list of available rewards to claim
 */
async function findClaimableRewards({ userId, campaign, referralCount }, pgdb) {
  if (!referralCount) {
    // no referrals
    return
  }
  // get relevant campaign rewards
  const rewards = await pgdb.public.campaignRewards.find({
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
  const claimedRewards = await pgdb.public.userCampaignRewards.find({
    userId: userId,
    campaignRewardId: rewardIds,
  })

  const claimedRewardIds = claimedRewards.map((cr) => cr.id)
  const rewardsToClaim = rewards.filter(
    (reward) => !claimedRewardIds.includes(reward.id),
  )

  return rewardsToClaim
}

/**
 * Claim passed rewards for user
 * @param {ClaimRewardsInput} claimRewardsInput
 * @param pgdb db instance
 * @returns {Promise<>}
 */
async function claimRewards({ activeMembership, userId, rewards }, pgdb) {
  return bluebird.each(rewards, async (reward) => {
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

async function claimBonusMonths({ activeMembership, userId, reward }, pgdb) {
  const tx = pgdb.openTransaction()

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
    await tx.commitTransaction()
    debug(newMembershipPeriod)

    return newMembershipPeriod
  } catch (e) {
    await tx.transactionRollback()
    console.error('transaction rollback, not claiming bonus month', e)
  }
}

module.exports = { findClaimableRewards, claimRewards }
