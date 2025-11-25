import { graphql } from '@apollo/client/react/hoc'

import { updateNotificationSettingsMutation } from '../documents'

/**
 * Provides the component with
 *
 *   {
 *     updateNotificationSettings({ … })
 *   }
 */

export const withUpdateNotificationSettings = graphql(
  updateNotificationSettingsMutation,
  {
    props: ({ mutate }) => ({
      updateNotificationSettings: ({
        notificationChannels,
        defaultDiscussionNotificationOption,
      }) =>
        mutate({
          variables: {
            notificationChannels,
            defaultDiscussionNotificationOption,
          },
        }),
    }),
  },
)
