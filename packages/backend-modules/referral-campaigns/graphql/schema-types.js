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
  from: Date!
  to: Date!
}
`
