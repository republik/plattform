import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import { documentFragment } from '../Feed/fragments'

export const notificationInfo = gql`
  fragment notificationInfo on Notification {
    id
    readAt
    createdAt
  }
`

export const subInfo = gql`
  fragment subInfo on Subscription {
    id
    isEligibleForNotifications
    active
    filters
    object {
      ... on User {
        id
        name
      }
      ... on Document {
        id
        meta {
          title
        }
      }
    }
  }
`

export const notificationsMiniQuery = gql`
  query getNotificationsMini {
    notifications(first: 3, onlyUnread: true) {
      nodes {
        id
        readAt
        createdAt
        object {
          __typename
          ... on Comment {
            id
            published
          }
          ... on Document {
            id
            meta {
              format {
                meta {
                  externalBaseUrl
                }
              }
            }
          }
        }
        content {
          title
          url
        }
      }
    }
  }
`

export const notificationsQuery = gql`
  query getNotifications($after: String) {
    me {
      id
      discussionNotificationChannels
    }
    notifications(first: 10, after: $after) {
      totalCount
      unreadCount
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        readAt
        createdAt
        object {
          ... on Document {
            ...FeedDocument
          }
          ... on Comment {
            id
            preview(length: 120) {
              string
              more
            }
            createdAt
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
            published
            updatedAt
            tags
            parentIds
            discussion {
              id
              title
              path
              isBoard
              document {
                id
                meta {
                  title
                  path
                  credits
                  template
                  ownDiscussion {
                    id
                    path
                    closed
                  }
                  linkedDiscussion {
                    id
                    path
                    closed
                  }
                }
              }
            }
          }
          __typename
        }
        subscription {
          ...subInfo
        }
        content {
          title
          url
        }
        channels
      }
    }
  }
  ${documentFragment}
  ${subInfo}
`

export const possibleSubscriptions = gql`
  query getSubscriptions {
    sections: documents(template: "section") {
      nodes {
        id
        repoId
        meta {
          title
          color
          suggestSubscription
        }
        formats: linkedDocuments {
          nodes {
            id
            subscribedByMe {
              ...subInfo
            }
          }
        }
      }
    }
  }
  ${subInfo}
`

export const myUserSubscriptions = gql`
  query getMyUserSubscriptions {
    myUserSubscriptions: me {
      id
      subscribedTo(objectType: User) {
        nodes {
          ...subInfo
          userDetails: object {
            ... on User {
              id
              slug
              documents {
                totalCount
              }
            }
          }
        }
      }
    }
  }
  ${subInfo}
`

const notificationCountQuery = gql`
  query getNotificationCount {
    notifications(onlyUnread: true) {
      nodes {
        ...notificationInfo
      }
    }
  }
  ${notificationInfo}
`

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation markNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      ...notificationInfo
    }
  }
  ${notificationInfo}
`

const markAllAsReadMutation = gql`
  mutation markAllNotificationsAsRead {
    markAllNotificationsAsRead {
      ...notificationInfo
    }
  }
  ${notificationInfo}
`

export const subscribeToDocumentMutation = gql`
  mutation subToDoc($documentId: ID!, $filters: [EventObjectType!]) {
    subscribe(objectId: $documentId, type: Document, filters: $filters) {
      ...subInfo
    }
  }
  ${subInfo}
`
export const unsubscribeFromDocumentMutation = gql`
  mutation unSubFromDoc($subscriptionId: ID!, $filters: [EventObjectType!]) {
    unsubscribe(subscriptionId: $subscriptionId, filters: $filters) {
      ...subInfo
    }
  }
  ${subInfo}
`
const subscribeToUserMutation = gql`
  mutation subToUser($userId: ID!, $filters: [EventObjectType!]) {
    subscribe(objectId: $userId, type: User, filters: $filters) {
      ...subInfo
    }
  }
  ${subInfo}
`

const unsubscribeFromUserMutation = gql`
  mutation unSubFromUser($subscriptionId: ID!, $filters: [EventObjectType!]) {
    unsubscribe(subscriptionId: $subscriptionId, filters: $filters) {
      ...subInfo
    }
  }
  ${subInfo}
`

export const notificationSubscription = gql`
  subscription {
    notification {
      ...notificationInfo
    }
  }
  ${notificationInfo}
`

export const withNotificationCount = graphql(notificationCountQuery, {
  name: 'countData',
})

const alreadyMarkedAsReadIds = []
export const withMarkAsReadMutation = graphql(
  MARK_NOTIFICATION_AS_READ_MUTATION,
  {
    props: ({ mutate }) => ({
      markAsReadMutation: (id) => {
        if (alreadyMarkedAsReadIds.includes(id)) {
          return Promise.resolve()
        }
        alreadyMarkedAsReadIds.push(id)
        return mutate({
          variables: {
            id,
          },
        })
      },
    }),
  },
)

export const withMarkAllAsReadMutation = graphql(markAllAsReadMutation, {
  props: ({ mutate }) => ({
    markAllAsReadMutation: () => {
      return mutate()
    },
  }),
})

export const withSubToDoc = graphql(subscribeToDocumentMutation, {
  props: ({ mutate }) => ({
    subToDoc: (variables) =>
      mutate({
        variables,
      }),
  }),
})

export const withSubToUser = graphql(subscribeToUserMutation, {
  props: ({ mutate }) => ({
    subToUser: (variables) =>
      mutate({
        variables,
      }),
  }),
})

export const withUnsubFromUser = graphql(unsubscribeFromUserMutation, {
  props: ({ mutate }) => ({
    unsubFromUser: (variables) =>
      mutate({
        variables,
      }),
  }),
})

export const withUnsubFromDoc = graphql(unsubscribeFromDocumentMutation, {
  props: ({ mutate }) => ({
    unsubFromDoc: (variables) =>
      mutate({
        variables,
      }),
  }),
})
