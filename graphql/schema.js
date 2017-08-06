const typeDefinitions = `
schema {
  query: RootQuerys
  mutation: RootMutations
  subscription: RootSubscription
}

type RootQuerys {
  me: User
  repository(owner: String!, name: String): Repository
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!

  commit(login: String!, repository: String!, branch: String!, path: String!, commitOid: String!, message: String!, content: String!): Commit!

  uncommitedChanges(owner: String!, name: String!, path: String! action: Action): Boolean!
}

type RootSubscription {
  uncommitedChanges(owner: String! name: String!, path: String!): UncommitedChangeUpdate!
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


type Repository {
  uncommitedChanges(path: String!): [User!]!
}

enum Action {
  create
  delete
}

type UncommitedChangeUpdate {
  owner: String!
  name: String!
  path: String!
  user: User!
  action: Action!
}
`
module.exports = [typeDefinitions]
