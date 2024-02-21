import type { UserRow } from '@orbiting/backend-modules-types'
import type { PgDb } from 'pogi'
import type { Campaign } from '../graphql/types'
import type { CampaignRewardRow, UserCampaignRewardsRow } from './types'

export interface ReferralCampaignRepo {
  getCampaignBySlug(slug: string): Promise<Campaign | null>
  getCampaignReferralCount(campaignId: string): Promise<number | number>
  getUserCampaignReferralCount(
    campaignId: string,
    userId: string,
  ): Promise<number | number>
  getClaimableRewards(
    campaignId: string,
    userId: string,
    referralCount: number,
  ): Promise<CampaignRewardRow[] | null>
  saveCampaignReferral(
    campaignId: string,
    pledgeId: string,
    referrerId?: string,
  ): Promise<any>
}

export interface ReferralCodeRepo {
  getReferralCountByReferrerId(id: string): Promise<number | null>
  getUserByReferralCode(referralCode: string): Promise<UserRow | null>
  updateUserReferralCode(
    userId: string,
    referralCode: string,
  ): Promise<UserRow | null>
}

export class PGReferralsRepo implements ReferralCampaignRepo, ReferralCodeRepo {
  #pgdb: PgDb

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
  }

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    return await this.#pgdb.public.campaigns.findOne({
      slug: slug,
    })
  }

  async getCampaignReferralCount(campaignId: string): Promise<number> {
    return await this.#pgdb.public.referrals.count({
      campaignId: campaignId,
    })
  }

  async getUserCampaignReferralCount(
    campaignId: string,
    userId: string,
  ): Promise<number> {
    return await this.#pgdb.public.referrals.count({
      campaignId: campaignId,
      referrerId: userId,
    })
  }

  async getClaimableRewards(
    campaignId: string,
    userId: string,
    referralCount: number,
  ): Promise<CampaignRewardRow[] | null> {
    const rewards: CampaignRewardRow[] =
      await this.#pgdb.public.campaignRewards.find({
        campaignId: campaignId,
        '"referralCountThreshold"<=': referralCount,
      })

    if (!rewards || !rewards.length) {
      return null
    }

    // check if reward has already been claimed
    const rewardIds = rewards.map((reward) => reward.id)
    const claimedRewards: UserCampaignRewardsRow[] =
      await this.#pgdb.public.userCampaignRewards.find({
        userId: userId,
        campaignRewardId: rewardIds,
      })

    const claimedRewardIds = claimedRewards.map((cr) => cr.id)
    const rewardsToClaim = rewards.filter(
      (reward) => !claimedRewardIds.includes(reward.id),
    )

    return rewardsToClaim
  }

  async saveCampaignReferral(
    campaignId: string,
    pledgeId: string,
    referrerId?: string,
  ): Promise<any> {
    const tx = await this.#pgdb.transactionBegin()

    const args = referrerId
      ? { pledgeId, campaignId, referrerId }
      : { pledgeId, campaignId }

    try {
      const newReferral = await tx.public.referrals.insertAndGet(args)

      await tx.transactionCommit()
      return newReferral
    } catch (e) {
      await tx.transactionRollback()
      console.error(e)
      return null
    }
  }

  async getReferralCountByReferrerId(id: string): Promise<number> {
    return await this.#pgdb.public.referrals.count({
      referrerId: id,
    })
  }

  async getUserByReferralCode(referralCode: string): Promise<UserRow> {
    return await this.#pgdb.public.users.findOne({
      referralCode: referralCode,
    })
  }

  async updateUserReferralCode(
    userId: string,
    referralCode: string,
  ): Promise<UserRow> {
    const userRow = await this.#pgdb.public.users.updateAndGetOne(
      { id: userId },
      { referralCode: referralCode },
    )

    return userRow
  }
}
