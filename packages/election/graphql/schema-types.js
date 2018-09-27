module.exports = `

extend type User {
  candidacies: [Candidacy!]!
}

type Election {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  numSeats: Int!

  candidacies: [Candidacy!]!
  discussion: Discussion!
}

type Candidacy {
  id: ID!
  recommendation: String

  user: User!
  election: Election!
  comment: Comment!

  yearOfBirth: Int!
  city: String!
}

input ElectionInput {
  slug: String!
  description: String!
  beginDate: DateTime!
  endDate: DateTime!
  numSeats: Int!
}

`
