'use client'

import {
  NewsletterSettingsDocument,
  SignUpForNewsletterDocument,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { isSubscribedToNewsletter } from '@/app/(sanity)/components/newsletters/helpers'
import { NewslettersStatus } from '@/app/(sanity)/components/newsletters/newsletters-status'
import { ErrorMessage } from '@/app/components/auth/login/error-message'
import { Button } from '@/app/components/ui/button'
import { FormField } from '@/app/components/ui/form'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@/app/lib/analytics/utm-session-storage'
import { useTranslation } from '@/lib/withT'
import { ApolloError, useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import isEmail from 'validator/lib/isEmail'

function NewsletterSubscribeForm({ newsletter }) {
  const { t } = useTranslation()
  const track = useTrackEvent()
  const [subscribe] = useMutation(SignUpForNewsletterDocument)

  const [isPending, setIsPending] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [error, setError] = useState<ApolloError | string | undefined>()

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

    const result = await subscribe({
      variables: {
        email: email,
        name: newsletter.name,
        context: 'newsletter',
        meta: getUTMSessionStorage(),
      },
    })

    if (result.errors && result.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: result.errors }))
      return setIsPending(false)
    }

    track({
      action: 'Anonymous Newsletter Subscribe',
      name: newsletter.title,
    })
    setIsPending(false)
    setConfirmEmail(true)
  }

  if (confirmEmail) {
    return (
      <p className={css({ textStyle: 'airy' })}>
        {t('Auth/NewsletterSignUp/success')}
      </p>
    )
  }

  return (
    <form action='POST' onSubmit={submitEmail} key='email-submit'>
      <div className={css({ containerType: 'inline-size' })}>
        <div
          className={css({
            gap: '2',
            display: 'flex',
            alignItems: 'end',
            flexDirection: 'column',
            pb: 2,
            '@/md': { flexDirection: 'row' },
          })}
        >
          <FormField label='Ihre E-Mail-Adresse' name='email' type='email' />
          <div
            className={css({ display: 'none', '@/md': { display: 'block' } })}
          >
            <Button type='submit' disabled={isPending} loading={isPending}>
              {t('newsletter/subscribe')}
            </Button>
          </div>
        </div>
        {error && <ErrorMessage error={error} />}
        <div className={css({ '@/md': { display: 'none' } })}>
          <Button
            type='submit'
            size='full'
            disabled={isPending}
            loading={isPending}
          >
            {t('newsletter/subscribe')}
          </Button>
        </div>
      </div>
    </form>
  )
}

export function NewsletterSubscribeButton({ newsletter }) {
  const { t } = useTranslation()
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )
  const [isPending, setIsPending] = useState(false)
  const track = useTrackEvent()

  const { data } = useQuery(NewsletterSettingsDocument)

  if (!data) return null

  if (!data.me) {
    return <NewsletterSubscribeForm newsletter={newsletter} />
  }

  const subscriptions = data.me.newsletterSettings.subscriptions
  const isDisabled = data.me.newsletterSettings.status !== 'subscribed'
  const isSubscribed = isSubscribedToNewsletter(newsletter.name, subscriptions)

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending || isDisabled) return

    setIsPending(true)
    const { data } = await updateNewsletterSubscription({
      variables: {
        name: newsletter.name,
        subscribed: !isSubscribed,
      },
    })

    if (data) {
      track({
        action: data.updateNewsletterSubscription.subscribed
          ? 'Newsletter Subscribe'
          : 'Newsletter Unsubscribe',
        name: newsletter.title,
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
      {isSubscribed ? t('newsletter/isSubscribed') : t('newsletter/subscribe')}
    </Button>
  )
}
