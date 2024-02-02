module.exports = `

type Referrals {
  count: Int!
}

extend type User {
  referrals(campaign: ID): Referrals
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
