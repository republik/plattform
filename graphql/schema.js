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
  commit(login: String!, repository: String!, branch: String!, path: String!, commitOid: String!, message: String!, content: String!): Commit!
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
  githubAccessToken: String
  githubScope: String
}

type Commit {
  sha: String!
  ref: String!
}

`
module.exports = [typeDefinitions]
