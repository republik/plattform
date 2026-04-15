import { gql } from '@apollo/client'
import { notificationInfo } from '../../../Notifications/enhancers'
import Nullable from '../../../../lib/types/Nullable'
import { DateTime, DiscussionCredential } from '../types/SharedTypes'

type CommentFeaturedTarget = 'DEFAULT' | 'MARKETING'
type CommentVote = 'UP' | 'DOWN'

export type CommentFragmentType = {
  id: string
  text: Nullable<string>
  content: Record<string, any>
  published: boolean
  adminUnpublished: Nullable<boolean>
  featuredAt: Nullable<DateTime>
  featuredText: Nullable<string>
  featuredTargets: Nullable<CommentFeaturedTarget[]>
  downVotes: number
  upVotes: number
  userVote: Nullable<CommentVote>
  userCanEdit: Nullable<boolean>
  userCanReport: boolean
  userReportedAt: Nullable<DateTime>
  numReports: Nullable<number>
  displayAuthor: {
    id: string
    name: string
    slug: Nullable<string>
    profilePicture: Nullable<string>
    credential: Pick<DiscussionCredential, 'description' | 'verified'>
  }
  unreadNotifications: Nullable<{
    nodes: {
      id: string
      readAt: Nullable<DateTime>
      createAt: DateTime
    }[]
  }>
  updatedAt: DateTime
  createdAt: DateTime
  parentIds: string[]
  tags: string[]
}

export const COMMENT_FRAGMENT = gql`
  fragment Comment on Comment {
    id
    text
    content
    published
    adminUnpublished
    featuredAt
    featuredText
    featuredTargets
    downVotes
    upVotes
    userVote
    userCanEdit
    userCanReport
    userReportedAt
    numReports
    displayAuthor {
      id
      name
      slug
      profilePicture
      credential {
        id
        description
        verified
      }
    }
    unreadNotifications {
      nodes {
        ...notificationInfo
      }
    }
    updatedAt
    createdAt
    parentIds
    tags
  }
  ${notificationInfo}
`
