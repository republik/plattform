import {
  SubscribeDocument,
  SubscriptionObjectType,
  UnsubscribeDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Button } from '@app/components/ui/button'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { postMessage } from '../../../lib/withInNativeApp'

export function FollowButton({
  type,
  subscriptionId,
  objectId,
  objectName,
}: {
  type: SubscriptionObjectType
  subscriptionId?: string
  objectId: string
  objectName: string
}) {
  const [subscribe] = useMutation(SubscribeDocument)
  const [unsubscribe] = useMutation(UnsubscribeDocument)
  const [isPending, setIsPending] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const track = useTrackEvent()
  const trackingInfo = `${type}: ${objectName}`

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    // while we disable the button for the whole duration of the request,
    // we only show the spinner if the request takes longer than 1s
    const spinner = setTimeout(() => setShowSpinner(true), 1000)

    if (subscriptionId) {
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
