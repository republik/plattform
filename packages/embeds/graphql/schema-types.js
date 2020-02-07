module.exports = `

enum EmbedType {
  YoutubeEmbed
  VimeoEmbed
  TwitterEmbed
  DocumentCloudEmbed
}

union Embed = TwitterEmbed | YoutubeEmbed | VimeoEmbed | DocumentCloudEmbed
union CachedEmbed = LinkPreview | TwitterEmbed

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

type DocumentCloudEmbed {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  retrievedAt: DateTime!
  contributorUrl: String
  contributorName: String
  thumbnail: String!
  title: String!
  url: String!
}

type LinkPreview {
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
