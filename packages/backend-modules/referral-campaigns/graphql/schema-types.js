module.exports = `

type UserReferrals {
  count: Int!
}

extend type User {
  referrals(campaign: ID): UserReferrals
}

type Campaign {
  id: ID!
  name: String!
  description: String
  beginDate: Date!
  endDate: Date!
}
`
