import type { PgDb } from 'pogi'
import type { CampaignRewardRow, ReferrersWithCountRow } from './types'
import {
  applyStripeCampaignCoupon,
  ensureActiveMonthlySubscription,
} from './stripeCoupon'
import { PGReferralsRepo } from './repo'

const debug = require('debug')('referralCampaigns:lib:rewardsHandler')
const dayjs = require('dayjs')
const bluebird = require('bluebird')

// TODO get from graphql enum type
const REWARD_TYPES = ['bonus_month']

type RewardReferrersInput = {
  dryRun: boolean
}

/**
 * Check rewards to claim for referrers in scheduler, claim rewards
 * @param args scheduler arguments, contains dryRun
 * @param pgdb db instance
 */
export async function rewardReferrers(args: RewardReferrersInput, pgdb: PgDb) {
  const repo = new PGReferralsRepo(pgdb)

  const referrersWithCounts = await repo.getReferrersWithUnclaimedRewards()

  bluebird.each(
    referrersWithCounts,
    async (referrerWithCount: ReferrersWithCountRow) => {
      try {
        const { referrerId, campaignId, referralCount } = referrerWithCount

        const activeMembership = await pgdb.public.memberships.findOne({
          userId: referrerId,
          active: true,
        })

        if (activeMembership) {
          const rewardsToClaim = await repo.getClaimableRewards(
            campaignId,
            referrerId,
            referralCount,
          )
          debug('rewards to claim', rewardsToClaim)
          if (!rewardsToClaim || !rewardsToClaim.length) {
            debug(
              'No claimable rewards found for user and campaign',
              referrerId,
              campaignId,
            )
            return
          }

          // only claim rewards if not in dryRun
          if (args.dryRun) {
            console.log(
              'Dry run, not claiming rewards, rewards to claim: ' +
                JSON.stringify(rewardsToClaim),
            )
          } else {
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
      } catch (e) {
        console.error(
          `Error while trying to claim referral camapign reward for ${JSON.stringify(
            referrerWithCount,
          )}`,
          e,
        )
      }
    },
  )
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

    // handle stripe bonus month by appling discount coupon
    if (reward.type === 'bonus_month' && activeMembership?.subscriptionId) {
      return await claimStripeBonusMonth(
        { activeMembership, userId, reward },
        pgdb,
      )
    }
    // generate bonus month
    if (reward.type === 'bonus_month') {
      return await claimBonusMonths({ activeMembership, userId, reward }, pgdb)
    }
  })
}

type RewardHandlerInput = {
  activeMembership: any
  userId: string
  reward: CampaignRewardRow
}

async function claimBonusMonths(
  { activeMembership, userId, reward }: RewardHandlerInput,
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

async function claimStripeBonusMonth(
  rewardHandlerInput: RewardHandlerInput,
  pgdb: PgDb,
) {
  const tx = await pgdb.transactionBegin()

  try {
    await tx.public.userCampaignRewards.insert({
      userId: rewardHandlerInput.userId,
      campaignRewardId: rewardHandlerInput.reward.id,
    })

    ensureActiveMonthlySubscription(rewardHandlerInput.activeMembership)
    await applyStripeCampaignCoupon(rewardHandlerInput.activeMembership)

    await tx.transactionCommit()

    return 'success'
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
