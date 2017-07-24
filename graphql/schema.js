const typeDefinitions = `
schema {
  query: RootQuerys
  mutation: RootMutations
}

type RootQuerys {
  me: User
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!
}


type SignInResponse {
  phrase: String!
}

type User {
  id: ID!
  name: String
  firstName: String
  lastName: String
  email: String!
}

`
module.exports = [typeDefinitions]
