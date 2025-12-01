/**
 * This JavaScript module exports all GraphQL documents (queries, mutations,
 * subscription) which are used throughout the Discussion components.
 *
 * Most of these documents are used from the enhancers (see ./enhancers/*). Though
 * they can be imported and used elsewhere, too.
 *
 * Fragments that are used by these documents are stored in a separate file.
 */

import { gql } from '@apollo/client'
import { DISCUSSION_FRAGMENT } from './fragments/DiscussionFragment.graphql'
import { COMMENT_FRAGMENT } from './fragments/CommentFragment.graphql'

/*
 * QUERIES
 */

export const discussionCommentsCountQuery = gql`
  query discussionCommentsCount($discussionId: ID!) {
    discussion(id: $discussionId) {
      ...Discussion
      comments(first: 0) {
        totalCount
      }
    }
  }
  ${DISCUSSION_FRAGMENT}
`
export const discussionDisplayAuthorQuery = gql`
  query discussionDisplayAuthor($discussionId: ID!) {
    discussion(id: $discussionId) {
      ...Discussion
    }
  }
  ${DISCUSSION_FRAGMENT}
`

export const discussionFragmentQuery = gql`
  query discussionFragment($discussionId: ID!) {
    discussion(id: $discussionId) {
      ...Discussion
    }
  }
  ${DISCUSSION_FRAGMENT}
`

/*
 * MUTATIONS
 */

export const UPVOTE_COMMENT_MUTATION = gql`
  mutation upvoteCommentMutation($commentId: ID!) {
    upvoteComment(id: $commentId) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const REPORT_COMMENT_MUTATION = gql`
  mutation reportCommentMutation($commentId: ID!, $description: String) {
    reportComment(id: $commentId, description: $description) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const DOWN_VOTE_COMMENT_ACTION = gql`
  mutation downvoteComment($commentId: ID!) {
    downvoteComment(id: $commentId) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const UP_VOTE_COMMENT_ACTION = gql`
  mutation unvoteComment($commentId: ID!) {
    unvoteComment(id: $commentId) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const EDIT_COMMENT_MUTATION = gql`
  mutation editComment($commentId: ID!, $content: String!, $tags: [String!]) {
    editComment(id: $commentId, content: $content, tags: $tags) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const UNPUBLISH_COMMENT_MUTATION = gql`
  mutation unpublishComment($commentId: ID!) {
    unpublishComment(id: $commentId) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const updateNotificationSettingsMutation = gql`
  mutation updateNotificationSettings(
    $defaultDiscussionNotificationOption: DiscussionNotificationOption
    $notificationChannels: [NotificationChannel!]
  ) {
    updateNotificationSettings(
      defaultDiscussionNotificationOption: $defaultDiscussionNotificationOption
      notificationChannels: $notificationChannels
    ) {
      id
      notificationChannels
      defaultDiscussionNotificationOption
    }
  }
`

export const SET_DISCUSSION_PREFERENCES_MUTATION = gql`
  mutation setDiscussionPreferences(
    $discussionId: ID!
    $discussionPreferences: DiscussionPreferencesInput!
  ) {
    setDiscussionPreferences(
      id: $discussionId
      discussionPreferences: $discussionPreferences
    ) {
      ...Discussion
    }
  }
  ${DISCUSSION_FRAGMENT}
`

/*
 * SUBSCRIPTIONS
 */

export const webNotificationSubscription = gql`
  subscription {
    webNotification {
      title
      body
      icon
      url
      tag
    }
  }
`

export const COMMENT_SUBSCRIPTION = gql`
  subscription discussionComments($discussionId: ID!) {
    comment(discussionId: $discussionId) {
      mutation
      node {
        ...Comment
      }
    }
  }
  ${COMMENT_FRAGMENT}
`
