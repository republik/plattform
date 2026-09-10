'use client'

import {
  EventObjectType,
  SubscribedByMeDocument,
  SubscribeDocument,
  SubscriptionObjectType,
  UnsubscribeDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { Button } from '@/app/components/ui/button'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { postMessage } from '@/lib/withInNativeApp'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { ButtonVariantProps } from '@republik/theme/recipes'
import { useState, useTransition } from 'react'

export function FollowButton({
  type,
  objectId,
  objectName,
  size = 'small',
  filters = [EventObjectType.Document],
}: {
  type: SubscriptionObjectType
  objectId?: string
  objectName?: string
  size?: ButtonVariantProps['size']
  filters?: EventObjectType[]
}) {
  const { data, refetch } = useQuery(SubscribedByMeDocument, {
    variables: {
      objectId,
      type,
    },
  })

  const [subscribe] = useMutation(SubscribeDocument)
  const [unsubscribe] = useMutation(UnsubscribeDocument)
  const [isPending, startTransition] = useTransition()
  const [showSpinner, setShowSpinner] = useState(false)
  const track = useTrackEvent()
  const trackingInfo = `${type}: ${objectName}`

  const subscriptionId = data?.subscribedByMe?.id
  const subscriptionActive = data?.subscribedByMe?.active ?? false

  function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return
    startTransition(async () => {
      // while we disable the button for the whole duration of the request,
      // we only show the spinner if the request takes longer than 1s
      const spinner = setTimeout(() => setShowSpinner(true), 1000)

      if (subscriptionId && subscriptionActive) {
        await unsubscribe({
          variables: {
            subscriptionId,
          },
        })
        track({
          action: 'Unfollow',
          name: trackingInfo,
        })
      } else {
        await subscribe({
          variables: {
            objectId,
            type,
            filters,
          },
        })
        track({
          action: 'Follow',
          name: trackingInfo,
        })
        // triggers the push permission popup in the app
        postMessage({ type: 'isSignedIn', payload: true })
      }
      clearTimeout(spinner)
      setShowSpinner(false)
      refetch()
    })
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
      size={size}
      variant={subscriptionActive ? 'outline' : 'default'}
      loading={showSpinner}
    >
      {subscriptionActive ? 'Gefolgt' : 'Folgen'}
    </Button>
  )
}
