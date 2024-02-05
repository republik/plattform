module.exports = `

type Referrals {
  count: Int!
}

extend type User {
  referrals(campaign: ID): Referrals
  # A user specific referral code
  # the code is generated the first time that the referral code is resolved
  referralCode: String
}

type Campaign {
  id: ID!
  name: String!
  description: String
  beginDate: Date!
  endDate: Date!
  referrals: Referrals!
}
`
