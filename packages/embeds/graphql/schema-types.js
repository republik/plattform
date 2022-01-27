module.exports = `

enum EmbedType {
  YoutubeEmbed
  VimeoEmbed
  TwitterEmbed
}

union Embed = LinkPreview | TwitterEmbed | YoutubeEmbed | VimeoEmbed

type TwitterEmbed {
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
  more: String
  playable: Boolean!
  url: String!
}

type YoutubeEmbed implements PlayableMedia {
  id: ID!
  platform: String!
  createdAt: DateTime!
  retrievedAt: DateTime!
  userUrl: String!
  userName: String!
  thumbnail: String!
  title: String!
  userProfileImageUrl: String
  aspectRatio: Float
  mediaId: ID!
  durationMs: Int!
}

type VimeoSrc {
  mp4: String,
  hls: String,
  thumbnail: String
}

type VimeoEmbed implements PlayableMedia {
  id: ID!
  platform: String!
  createdAt: DateTime!
  retrievedAt: DateTime!
  userUrl: String!
  userName: String!
  thumbnail: String!
  title: String!
  userProfileImageUrl: String
  aspectRatio: Float,
  src: VimeoSrc
  mediaId: ID!
  durationMs: Int!
}

type LinkPreview {
  id: ID!
  url: String!
  title: String!
  description: String
  imageUrl: String
  imageAlt: String
  siteName: String!
  siteImageUrl: String
  updatedAt: DateTime!
}

`
