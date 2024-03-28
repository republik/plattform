export type Campaign = {
  id: string
  slug: string
  name: string
  description: string
  beginDate: string
  endDate: string
  referrals: object
}

export type ReferralCount = {
  count: number
}
