module.exports = `

extend type User {
  referrals(campaign: ID): Int!
}


type Campaign {
  id: ID!
  name: String!
  from: Date!
  to: Date!
}
`
