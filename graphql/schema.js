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
  commit(organization: String!, repo: String!, branch: String!, path: String!, message: String!, content: String!): Commit!
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
}

`
module.exports = [typeDefinitions]
