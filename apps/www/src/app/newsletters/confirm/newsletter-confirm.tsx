'use client'

import { UpdateNewsletterSubscriptionWithMacDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { ErrorMessage } from '@app/components/auth/login/error-message'
import { Spinner } from '@app/components/ui/spinner'
import { ApolloError, useMutation } from '@apollo/client'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../../../lib/withT'
import * as base64u from '../../../../lib/utils/base64u'

type Props = {
  name: string
  email: string
  subscribed: string
  mac: string
}

export function NewsletterConfirm({ name, email, subscribed, mac }: Props) {
  const { t } = useTranslation()
  const displayName = t(`newsletters/${name}/name`, undefined, name)
  const decodedEmail = base64u.maybeDecode(email)
  const hasRun = useRef(false)

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [error, setError] = useState<ApolloError | string | undefined>()

  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionWithMacDocument,
  )

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    updateNewsletterSubscription({
      variables: {
        name,
        subscribed: subscribed === '1',
        email: decodedEmail,
        mac,
        consents: ['PRIVACY'],
      },
    })
      .then(() => setStatus('success'))
      .catch((err) => {
        setError(err)
        setStatus('error')
      })
  }, [decodedEmail, mac, name, subscribed, updateNewsletterSubscription])

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
      {status === 'loading' && (
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

      {status === 'success' && (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' })}>
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
          <Link
            href='/newsletters'
            className={css({
              display: 'inline-block',
              mt: 4,
              px: 6,
              py: 3,
              background: 'contrast',
              color: 'text.inverted',
              textDecoration: 'none',
              _hover: { opacity: 0.85 },
            })}
          >
            Zu den Newslettern
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' })}>
          <h1
            className={css({
              textStyle: 'sansSerifMedium',
              fontSize: 'xl',
            })}
          >
            Anmeldung fehlgeschlagen
          </h1>
          <ErrorMessage error={error} />
          <Link
            href='/newsletters'
            className={css({
              color: 'text',
              textDecoration: 'underline',
            })}
          >
            Zu den Newslettern
          </Link>
        </div>
      )}
    </div>
  )
}
