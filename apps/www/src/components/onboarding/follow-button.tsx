import {
  SubscribeDocument,
  SubscriptionObjectType,
  UnsubscribeDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Button } from '@app/components/ui/button'
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

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    if (subscriptionId) {
      await unsubscribe({
        variables: {
          subscriptionId,
        },
      })
    } else {
      await subscribe({
        variables: {
          objectId,
          type,
        },
      }).then(() => postMessage({ type: 'isSignedIn', payload: true }))
    }
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
      loading={isPending}
    >
      {subscriptionId ? 'Gefolgt' : 'Folgen'}
    </Button>
  )
}
