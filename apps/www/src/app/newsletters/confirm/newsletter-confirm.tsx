'use client'

import { UpdateNewsletterSubscriptionWithMacDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { ErrorMessage } from '@/app/components/auth/login/error-message'
import { Button } from '@/app/components/ui/button'
import { Spinner } from '@/app/components/ui/spinner'
import { useMutation } from '@apollo/client'
import { css } from '@republik/theme/css'
import { CheckCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useTranslation } from '@/lib/withT'
import * as base64u from '@/lib/utils/base64u'

type Props = {
  name: string
  email: string
  mac: string
  signupRef?: string
}

export function NewsletterConfirm({ name, email, mac, signupRef }: Props) {
  const { t } = useTranslation()
  const displayName = t(`newsletters/${name}/name`, undefined, name)
  const decodedEmail = base64u.maybeDecode(email)
  const hasRun = useRef(false)

  const [updateNewsletterSubscription, { data, loading, error }] = useMutation(
    UpdateNewsletterSubscriptionWithMacDocument,
  )

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    updateNewsletterSubscription({
      variables: {
        name,
        subscribed: true, // newsletter confirmations will always subscribe the user.
        signup: {
          email: decodedEmail,
          mac,
          consents: ['PRIVACY'],
          ref: signupRef,
        },
      },
    })
  }, [decodedEmail, mac, name, signupRef, updateNewsletterSubscription])

  return (
    <div
      className={css({
        maxWidth: 'center',
        mx: 'auto',
        px: '15px',
        py: 16,
        textAlign: 'center',
      })}
    >
      {loading && (
        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            color: 'textSoft',
          })}
        >
          <Spinner size='large' />
          <span>Anmeldung wird verarbeitet…</span>
        </div>
      )}

      {data && !error && (
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center',
          })}
        >
          <CheckCircleIcon size={28} />
          <h1
            className={css({
              textStyle: 'sansSerifMedium',
              fontSize: 'xl',
            })}
          >
            Anmeldung bestätigt
          </h1>
          <p className={css({ color: 'textSoft', maxWidth: '480px' })}>
            Sie haben den Newsletter <strong>{displayName}</strong> erfolgreich
            abonniert.
          </p>
          <Button asChild>
            <Link href='/newsletter'>Zu den Newslettern</Link>
          </Button>
        </div>
      )}

      {error && (
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
          })}
        >
          <h1
            className={css({
              textStyle: 'sansSerifMedium',
              fontSize: 'xl',
            })}
          >
            Anmeldung fehlgeschlagen
          </h1>
          <ErrorMessage error={error} />
          <Button asChild>
            <Link href='/newsletter'>Zu den Newslettern</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
