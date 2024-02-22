export type CampaignRewardRow = {
  id: string
  campaignId: string
  referralCountThreshold: number
  name: string
  description: string
  type: string
  amount: number
  createdAt: string
  updatedAt: string
}

export type UserCampaignRewardsRow = {
  id: string
  userId: string
  campaignRewardId: string
  claimedAt: string
  createdAt: string
  updatedAt: string
}

export type ReferrersWithCountRow = {
  referrerId: string
  campaignId: string
  referralCount: number
}
