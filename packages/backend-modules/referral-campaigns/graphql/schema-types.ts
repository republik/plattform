export = `

type Referrals {
  count: Int!
}

extend type User {
  referrals(campaignSlug: String): Referrals
  # A user specific referral code
  # the code is generated the first time that the referral code is resolved
  referralCode: String
}

type Campaign {
  id: ID!
  slug: String!
  name: String!
  description: String
  isActive: Boolean!
  beginDate: DateTime!
  endDate: DateTime!
  referrals: Referrals!
}

enum ReferralCodeValidationResult {
  OK
  NOT_FOUND
  IS_OWN
}

`
