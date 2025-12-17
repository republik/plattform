import { graphql } from '@apollo/client/react/hoc'
import { CalloutMenu, IconButton } from '@project-r/styleguide'
import { IconNotifications, IconNotificationsNone } from '@republik/icons'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import withMe from '../../lib/apollo/withMe'
import EventObjectType from '../../lib/graphql-types/EventObjectType'
import { DISCUSSION_PREFERENCES_QUERY } from '../Discussion/graphql/queries/DiscussionPreferencesQuery.graphql'
import SubscribeCallout from './SubscribeCallout'
import { getSelectedDiscussionPreference } from './SubscribeDebate'

const checkIfSubscribedToAny = ({ data, subscriptions, showAuthorFilter }) =>
  //checks if any of the subscription nodes is set to active
  (subscriptions &&
    subscriptions.some(
      (subscription) =>
        subscription.active &&
        // Prevent showing subscribed if only read aloud is selected
        (subscription.filters?.length > 1 ||
          !subscription.filters?.includes(EventObjectType.READ_ALOUD)) &&
        (showAuthorFilter ||
          subscription.object?.__typename !== 'User' ||
          subscription.filters.includes('Document')),
    )) ||
  // or if a discussion is being followed
  (data && getSelectedDiscussionPreference(data) !== 'NONE')

const SubscribeMenu = ({
  data,
  router,
  discussionId,
  subscriptions,
  showAuthorFilter,
  userHasNoDocuments,
  label,
  labelShort,
  padded,
  loading,
  attributes,
}) => {
  const [animate, setAnimate] = useState(false)

  console.log('SubscribeMenu render', { subscriptions })

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setAnimate(false)
      }, 1 * 1000)
      return () => clearTimeout(timeout)
    }
  }, [animate])

  const { isSubscribedToAny, formatSubscriptions, authorSubscriptions } =
    useMemo(
      () => ({
        isSubscribedToAny: checkIfSubscribedToAny({
          data,
          subscriptions,
          showAuthorFilter,
        }),
        formatSubscriptions:
          subscriptions &&
          subscriptions.filter(
            (node) => node.object?.__typename === 'Document',
          ),
        authorSubscriptions: [], // replaced by a custom component at the end of the article
      }),
      [data, subscriptions],
    )

  // ensure icon is only shown if there is something to subscribe to
  if (
    !loading &&
    !formatSubscriptions?.length &&
    !authorSubscriptions?.length &&
    !discussionId
  ) {
    return null
  }

  const Icon = isSubscribedToAny ? IconNotifications : IconNotificationsNone

  // Render disabled IconButton until loaded and ready
  // - initiallyOpen is only respected on first CalloutMenu render
  //   and router.query.mute only becomes available once router.isReady
  // - while loading the callout menu looks empty
  if (!router.isReady || loading) {
    return (
      <IconButton Icon={Icon} label={label} labelShort={labelShort} disabled />
    )
  }

  return (
    <CalloutMenu
      padded={padded}
      Element={IconButton}
      elementProps={{
        Icon,
        label,
        labelShort,
      }}
      initiallyOpen={!!router.query.mute}
      attributes={attributes}
    >
      <SubscribeCallout
        showAuthorFilter={showAuthorFilter}
        userHasNoDocuments={userHasNoDocuments}
        discussionId={discussionId}
        formatSubscriptions={formatSubscriptions}
        authorSubscriptions={authorSubscriptions}
        setAnimate={setAnimate}
      />
    </CalloutMenu>
  )
}

export default compose(
  graphql(DISCUSSION_PREFERENCES_QUERY, {
    skip: (props) => !props.discussionId,
  }),
  withRouter,
  withMe,
)(SubscribeMenu)
