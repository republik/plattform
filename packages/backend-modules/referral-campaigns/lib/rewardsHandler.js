const debug = require('debug')('referralCampaigns:lib:rewardsHandler')
const dayjs = require('dayjs')
const Promise = require('bluebird')

const {
  getPeriodEndingLast,
} = require('../../republik-crowdfundings/lib/utils')
// TODO get from graphql enum type
const REWARD_TYPES = ['bonus_month']

/**
 * Find rewards available to claim for a user and campaign, returns any rewards to claim or null.
 * @param {string} userId
 * @param {} campaign
 * @param {} referralCount
 * @param pgdb db instance
 * @returns {Promise<>} list of available rewards to claim
 */
async function findClaimableRewards({ userId, campaign, referralCount }, pgdb) {
  if (!referralCount) {
    // no referrals
    return
  }
  // get relevant campaign rewards
  const rewards = await pgdb.public.campaignRewards.find({
    campaignId: campaign.id,
    '"referralCountThreshhold"<=': referralCount,
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
 * @param {string} userId
 * @param {} rewards
 * @param pgdb db instance
 * @returns {Promise<>}
 */
async function claimRewards({ userId, rewards }, pgdb) {
  return Promise.each(rewards, async (reward) => {
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
      return await claimBonusMonths({ userId, reward }, pgdb)
    }
  })
}

async function claimBonusMonths({ userId, reward }, pgdb) {
  const tx = pgdb.openTransaction()

  try {
    const activeMembership = await tx.public.memberships.findOne({
      userId: userId,
      active: true,
    })

    if (!activeMembership) {
      debug('sender has no more active membership')
      return
    }

    const membershipType = await tx.public.membershipTypes.findOne({
      id: activeMembership.membershipTypeId,
    })
    if (membershipType?.name === 'MONTHLY_ABO') {
      debug('sender has an activeMembership type which can not be extended')
      return
    }
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

    return newMembershipPeriod
  } catch (e) {
    await tx.transactionRollback()
    console.error('transaction rollback, not claiming bonus month', e)
  }
}

module.exports = { findClaimableRewards, claimRewards }
