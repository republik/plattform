import { ReactNode } from 'react'

type Discussion = {
  title?: string
  comments?: {
    totalCount: number
  }
}

export type Comment = {
  id: string
  content: unknown
  userVote?: 'UP' | 'DOWN'
  upVotes: number
  downVotes: number
  userCanEdit: boolean
  adminUnpublished: boolean
  comments: {
    totalCount: number
    nodes: Comment[]
  }
  discussion: Discussion
  published: boolean
  createdAt: string
  updatedAt: string
  displayAuthor: DisplayAuthor
  unavailable?: boolean
  parentIds?: string[]
  tags?: string[]
  embed?: Embed
}

export type DisplayAuthor = {
  name: string
  profilePicture?: string
  credential: {
    description: string
    verified?: boolean
  }
}

export type Embed = {
  __typename?: 'TwitterEmbed' | 'InstagramEmbed' | 'FacebookEmbed' | 'Embed'
  url: string
  title: string
  imageUrl: string
  imageAlt?: string
  image: string
  siteName: string
  userName: string
  userScreenName: unknown
  siteImageUrl: string
  userProfileImageUrl: string
  html: string
  description: string | ReactNode
  createdAt: string
}
