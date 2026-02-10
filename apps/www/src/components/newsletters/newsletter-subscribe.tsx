'use client'

import {
  NewsletterName,
  NewsletterSettingsDocument,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { ErrorMessage } from '@app/components/auth/login/error-message'
import { isSubscribedToNewsletter } from '@app/components/newsletters/helpers'
import { NewslettersStatus } from '@app/components/newsletters/newsletters-status'
import { Button } from '@app/components/ui/button'
import { FormField } from '@app/components/ui/form'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import isEmail from 'validator/lib/isEmail'
import { useTranslation } from '../../../lib/withT'

function NewsletterSubscribeForm() {
  const { t } = useTranslation()

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>()

  async function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isPending) {
      return
    }
    setIsPending(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email') as string

    if (!email || !isEmail(email)) {
      setIsPending(false)
      setError(t('auth/login/email/missing'))
      return
    }
  }

  return (
    <form action='POST' onSubmit={submitEmail} key='email-submit'>
      <div
        className={css({
          gap: '2',
          display: 'flex',
          alignItems: 'end',
        })}
      >
        <FormField label='Ihre E-Mail-Adresse' name='email' type='email' />
        <div>
          <Button type='submit' disabled={isPending} loading={isPending}>
            Newsletter abonnieren
          </Button>
        </div>
      </div>
      {error && <ErrorMessage error={error} />}
    </form>
  )
}

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

  if (!data) return null

  if (!data.me) {
    return <NewsletterSubscribeForm />
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
