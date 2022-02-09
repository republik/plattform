import { useCallback, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { MARK_NOTIFICATION_AS_READ_MUTATION } from '../../Notifications/enhancers'
import { DiscussionQuery } from '../graphql/queries/DiscussionQuery.graphql'

function useDiscussionNotificationHelper(
  discussion: DiscussionQuery['discussion'],
) {
  /* ---- Handle notifications ---- */
  const [markNotificationAsReadMutation] = useMutation<unknown, { id: string }>(
    MARK_NOTIFICATION_AS_READ_MUTATION,
  )

  const markNotificationAsRead = useCallback(() => {
    if (
      !discussion ||
      !discussion?.comments.nodes ||
      discussion?.comments.nodes.length === 0
    ) {
      return
    }

    // Get a single array containing all unread notifications
    const unreadNotifications = discussion.comments.nodes.reduce(
      (prev, comment) => {
        const notifications = comment.unreadNotifications
        if (
          !notifications ||
          !notifications?.nodes ||
          notifications.nodes.length === 0
        ) {
          return prev
        }

        // Get all notifications that haven't been read
        const filteredNotifications = notifications.nodes.filter(
          (notification) => !notification.readAt,
        )

        return [...prev, ...filteredNotifications]
      },
      [],
    )

    unreadNotifications.forEach((notification) => {
      return markNotificationAsReadMutation({
        variables: {
          id: notification.id,
        },
      })
    })
  }, [discussion?.comments, markNotificationAsReadMutation])

  useEffect(() => {
    if (!discussion?.comments) {
      return
    }
    markNotificationAsRead()
  }, [discussion?.comments])
}

export default useDiscussionNotificationHelper
