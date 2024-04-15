import type { UserRow } from '@orbiting/backend-modules-types'
import type { PgDb } from 'pogi'
import type {
  CampaignRewardRow,
  UserCampaignRewardsRow,
  ReferrersWithCountRow,
  CampaignRow,
} from './types'

export interface ReferralCampaignRepo {
  getCampaignBySlug(slug: string): Promise<CampaignRow | null>
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
  getReferrersWithUnclaimedRewards(): Promise<ReferrersWithCountRow[]>
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

  async getCampaignBySlug(slug: string): Promise<CampaignRow | null> {
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

  async getReferrersWithUnclaimedRewards(): Promise<ReferrersWithCountRow[]> {
    return await this.#pgdb
      .query(`SELECT r."referrerId", r."campaignId", COUNT(*) "referralCount"
      FROM referrals r
      LEFT JOIN "userCampaignRewards" ucr ON r."referrerId" = ucr."userId"
      WHERE ucr."userId" IS NULL
      AND r."referrerId" IS NOT NULL
      GROUP BY r."referrerId", r."campaignId"`)
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
