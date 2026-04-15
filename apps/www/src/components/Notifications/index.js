import { useState, useEffect } from 'react'
import Loader from '../Loader'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import {
  notificationsQuery,
  withMarkAllAsReadMutation,
  withNotificationCount,
} from './enhancers'
import NotificationFeed from './NotificationFeed'

export const containsUnread = (notifications, after) =>
  notifications &&
  notifications.nodes &&
  notifications.nodes
    .filter((n) => !after || new Date(n.createdAt) > after)
    .filter((n) => !n.readAt).length

const Notifications = compose(
  graphql(notificationsQuery),
  withMarkAllAsReadMutation,
  withNotificationCount,
)(
  ({
    data: { error, loading, notifications, me, fetchMore, refetch },
    countData,
    markAllAsReadMutation,
  }) => {
    const [loadedAt, setLoadedAt] = useState(new Date())
    const futureNotifications = containsUnread(
      countData.notifications,
      loadedAt,
    )

    const latestNotificationId = notifications?.nodes[0]?.id
    const unreadCount = notifications?.unreadCount

    useEffect(() => {
      if (latestNotificationId && !error && unreadCount) {
        markAllAsReadMutation()
      }
    }, [latestNotificationId, error, unreadCount])

    const reload = () => {
      refetch()
      setLoadedAt(new Date())
    }

    return (
      <Loader
        error={error}
        loading={loading}
        render={() =>
          notifications ? (
            <NotificationFeed
              futureNotifications={futureNotifications}
              onReload={reload}
              notifications={notifications}
              me={me}
              loadedAt={loadedAt}
              fetchMore={fetchMore}
            />
          ) : null
        }
      />
    )
  },
)

export default Notifications
