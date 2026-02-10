'use client'

import {
  NewsletterName,
  NewsletterSettingsDocument,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { isSubscribedToNewsletter } from '@app/components/newsletters/helpers'
import { NewslettersStatus } from '@app/components/newsletters/newsletters-status'
import { Button } from '@app/components/ui/button'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useState } from 'react'

export function NewsletterSubscribeButton({
  newsletter,
}: {
  newsletter: NewsletterName
}) {
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )
  const [isPending, setIsPending] = useState(false)
  const track = useTrackEvent()

  const { data } = useQuery(NewsletterSettingsDocument)

  if (!data?.me) {
    return null
  }

  const subscriptions = data.me.newsletterSettings.subscriptions
  const isDisabled = data.me.newsletterSettings.status !== 'subscribed'
  const isSubscribed = isSubscribedToNewsletter(newsletter, subscriptions)

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending || isDisabled) return

    setIsPending(true)
    const { data } = await updateNewsletterSubscription({
      variables: {
        name: newsletter,
        subscribed: !isSubscribed,
      },
    })

    if (data) {
      track({
        action: data.updateNewsletterSubscription.subscribed
          ? 'Newsletter Subscribe'
          : 'Newsletter Unsubscribe',
        name: data.updateNewsletterSubscription.name,
      })
    }
    setIsPending(false)
  }

  if (isDisabled)
    return <NewslettersStatus userId={data.me.id} status='unsubscribed' />

  return (
    <Button
      className={css({
        fontWeight: 500,
        textDecoration: 'none',
      })}
      onClick={toggleSubscription}
      disabled={isPending || isDisabled}
      type='button'
      variant={isSubscribed ? 'outline' : 'default'}
      loading={isPending}
    >
      Newsletter {isSubscribed ? 'abonniert' : 'abonnieren'}
    </Button>
  )
}
