const typeDefinitions = `
schema {
  query: RootQuerys
  mutation: RootMutations
  subscription: RootSubscription
}

type RootQuerys {
  me: User
  articles: [Article]!
  article(id: ID!): Article!
}

type Publication {
  commit: Commit!
  publishedAt: DateTime!
  scheduledPublishAt: DateTime!
}

# is a article.xxx in a repo
type Article {
  id: ID!                       # orbiting/haku-content-test
  commits: [Commit!]!
  milestones: [Milestone!]!
  uncommittedChanges: [User!]!
  document: Document!
}

type Document {
  commit: Commit!
  content: String!     # AST of /article.xxx
  title: String!       # convenience from content
#  readingMinutes: Int!
#  fbTitle: String
}

type Milestone {
  name: String!
  message: String
  commit: Commit!
  author: Autor!
}

type Commit {
  id: ID!
  parentIds: [ID!]!
  message: String
  author: Autor!
  date: DateTime!
  document: Document!
}

type Autor {
  name: String!
  email: String!
  user: User
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!

  commit(
    articleId: ID!
    parentId: ID!
    message: String!
    content: String!   # AST
    # files: [FileInput!]! # FileInput: path, content, encoding
  ): Commit!

  milestone(
    articleId: ID!
    name: String!
    commitId: ID!
    message: String!
    action: Action!
  ): Milestone!

  # creates a merge commits with the provided parents, message and content.
  # The content is submitted as a blob and a new tree is created
  # setting the blob at path. The tree is based on the tree of the first
  # parent's commit.
  # If one of the parents is the HEAD of the provided branch, the branch is
  # fast-forwarded to the new merge-commit. Otherwise a new branch is created.
  merge(
    articleId: ID!
    parentIds: [ID!]!
    content: String!
    message: String!
  ): Commit!

  # Inform about my uncommited changes on the path.
  # Use path without branch prefix.
  uncommittedChanges(
    articleId: ID!
    action: Action!
  ): Boolean!
}

type RootSubscription {
  # Provides updates to the list of users
  # with uncommited changes on the path.
  # Use path without branch prefix.
  uncommittedChanges(
    articleId: ID!
  ): UncommittedChangeUpdate!
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

enum Action {
  create
  delete
}

type UncommittedChangeUpdate {
  articleId: ID!
  action: Action!
}
`
module.exports = [typeDefinitions]
