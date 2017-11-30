module.exports = `
scalar DateTime
scalar JSON

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

  live: Boolean!
  prepublication: Boolean!
  scheduledAt: DateTime
  updateMailchimp: Boolean!
  sha: String!
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

enum Action {
  create
  delete
}

enum EmbedType {
  YoutubeEmbed
  VimeoEmbed
  TwitterEmbed
}

interface Embed {
  id: ID!
}

type TwitterEmbed implements Embed {
  id: ID!
  text: String!
  html: String!
  createdAt: DateTime!
  retrievedAt: DateTime!
  userId: String!
  userName: String!
  userScreenName: String!
  userProfileImageUrl: String!,
  image: String
}

type YoutubeEmbed implements Embed {
  id: ID!
  createdAt: String!
  userId: String!
  userName: String!
  thumbnail: String!
}

type VimeoEmbed implements Embed {
  id: ID!
  createdAt: String!
  userId: String!
  userName: String!
  thumbnail: String!
}
`
