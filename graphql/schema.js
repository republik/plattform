const typeDefinitions = `
scalar DateTime
scalar JSON

schema {
  query: RootQuerys
  mutation: RootMutations
  subscription: RootSubscription
}

type RootQuerys {
  me: User
  repos(first: Int!): [Repo]!
  repo(id: ID!): Repo!
  # (pre)published documents
  documents: [Document]!
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!

  commit(
    repoId: ID!
    # specifies the parent commit. May only be
    # null if repoId doesn't exist yet
    parentId: ID
    message: String!
    document: DocumentInput!
    # files: [FileInput!]!     # FileInput
  ): Commit!

  placeMilestone(
    repoId: ID!
    commitId: ID!
    name: String!
    message: String!
  ): Milestone!

  removeMilestone(
    repoId: ID!
    name: String!
  ): Boolean!

  publish(
    repoId: ID!
    commitId: ID!
    prepublication: Boolean!

    # on all channels
    scheduledAt: DateTime
    # this API never triggers sending
    # not immediately, not scheduled
    updateMailchimp: Boolean!
  ): Publication!

  #sendTestEmail(
  #  repoId: ID!
  #  addresses: [String!]!
  #)

  unpublish(
    repoId: ID!
  ): Boolean!

  # Inform about my uncommited changes in the repo
  uncommittedChanges(
    repoId: ID!
    action: Action!
  ): Boolean!
}

type RootSubscription {
  # Provides updates to the list of users
  # with uncommited changes in the repo
  uncommittedChanges(
    repoId: ID!
  ): UncommittedChangeUpdate!
}

type Repo {
  id: ID!
  commits(page: Int): [Commit!]!
  latestCommit: Commit!
  commit(id: ID!): Commit!
  uncommittedChanges: [User!]!
  milestones: [Milestone!]!

  # nothing or latest prepublication and/or latest publication
  # nothing if repo is unpublished
  latestPublications: [Publication]!

  mailchimpUrl: String
  unpublished: Boolean!
}

interface MilestoneInterface {
  name: String!
  commit: Commit!
  author: Author!
  date: DateTime!
}

type Publication implements MilestoneInterface {
  name: String!
  commit: Commit!
  author: Author!
  date: DateTime!

  prepublication: Boolean!
  scheduledAt: DateTime
  updateMailchimp: Boolean!
}

type Milestone implements MilestoneInterface {
  name: String!
  commit: Commit!
  author: Author!
  date: DateTime!

  message: String
  immutable: Boolean!
}


type Commit {
  id: ID!
  parentIds: [ID!]!
  message: String
  author: Author!
  date: DateTime!
  document: Document!
  repo: Repo!
# files: [File]!
}

interface FileInterface {
  content: JSON!
  meta: Meta!
}

type Document implements FileInterface {
  # AST of /article.md
  content: JSON!
  meta: Meta!
}

type Meta {
  title: String
  slug: String
  image: String
  emailSubject: String
  description: String
  facebookTitle: String
  facebookImage: String
  facebookDescription: String
  twitterTitle: String
  twitterImage: String
  twitterDescription: String
}

#type File implements FileInterface {
#  encoding: String!
#  content: JSON!
#  meta: Meta!
#}

type Author {
  name: String!
  email: String!
  user: User
}

type UncommittedChangeUpdate {
  repoId: ID!
  user: User!
  action: Action!
}

type User {
  id: ID!
  name: String
  firstName: String
  lastName: String
  email: String!
  roles: [String]!
}

type SignInResponse {
  phrase: String!
}

enum Action {
  create
  delete
}

# implements FileInterface
input DocumentInput {
  # AST of /article.md
  content: JSON!
}
`
module.exports = [typeDefinitions]
