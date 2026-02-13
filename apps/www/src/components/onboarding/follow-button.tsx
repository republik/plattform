import {
  FragmentType,
  getFragmentData,
} from '#graphql/republik-api/__generated__/gql'
import {
  EventObjectType,
  SubscribeDocument,
  SubscriptionFieldsFragmentDoc,
  SubscriptionObjectType,
  UnsubscribeDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Button } from '@app/components/ui/button'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { postMessage } from '../../../lib/withInNativeApp'

export function OnboardingFollowButton({
  subscriptionId,
  objectId,
  type,
}: {
  subscriptionId?: string
  objectId: string
  type: SubscriptionObjectType
}) {
  const [subscribe] = useMutation(SubscribeDocument)
  const [unsubscribe] = useMutation(UnsubscribeDocument)
  const [isPending, setIsPending] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const track = useTrackEvent()

  function trackSubscription(
    action: string,
    sub: FragmentType<typeof SubscriptionFieldsFragmentDoc>,
  ) {
    const { object } = getFragmentData(SubscriptionFieldsFragmentDoc, sub)

    if (object) {
      track({
        action,
        name:
          object.__typename === 'User'
            ? `Author: ${object.name}`
            : object.__typename === 'Document'
            ? `Format: ${object.meta.title}`
            : object.id,
      })
    }
  }

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    // while we disable the button for the whole duration of the request,
    // we only show the spinner if the request takes longer than 1s
    const spinner = setTimeout(() => setShowSpinner(true), 1000)

    if (subscriptionId) {
      const { data } = await unsubscribe({
        variables: {
          subscriptionId,
        },
      })
      if (data) {
        trackSubscription('Unfollow', data.unsubscribe)
      }
    } else {
      const { data } = await subscribe({
        variables: {
          objectId,
          type,
          filters: [EventObjectType.Document],
        },
      })
      if (data) {
        trackSubscription('Follow', data.subscribe)
        postMessage({ type: 'isSignedIn', payload: true })
      }
    }
    clearTimeout(spinner)
    setShowSpinner(false)
    setIsPending(false)
  }

  return (
    <Button
      className={css({
        fontWeight: 500,
        textDecoration: 'none',
      })}
      onClick={toggleSubscription}
      disabled={isPending}
      type='button'
      size='small'
      variant={subscriptionId ? 'outline' : 'default'}
      loading={showSpinner}
    >
      {subscriptionId ? 'Gefolgt' : 'Folgen'}
    </Button>
  )
}
