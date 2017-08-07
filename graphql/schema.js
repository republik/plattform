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

  # Inform about my uncommited changes on the path.
  # Use path without branch prefix.
  uncommittedChanges(login: String!, repository: String!, path: String! action: Action): Boolean!
}

type RootSubscription {
  # Provides updates to the list of users
  # with uncommited changes on the path.
  # Use path without branch prefix.
  uncommittedChanges(login: String! repository: String!, path: String!): UncommittedChangeUpdate!
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
  githubScope: String
}

type Commit {
  sha: String!
  ref: String!
}


type Repository {
  # List users with uncommited changes on the path.
  # Use path without branch prefix.
  uncommittedChanges(path: String!): [User!]!
}

enum Action {
  create
  delete
}

type UncommittedChangeUpdate {
  login: String!
  repository: String!
  path: String!
  user: User!
  action: Action!
}
`
module.exports = [typeDefinitions]
