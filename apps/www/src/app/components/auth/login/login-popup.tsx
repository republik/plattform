'use client'

import { Overlay } from '@/app/components/ui/overlay'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import * as Dialog from '@radix-ui/react-dialog'

import { css } from '@republik/theme/css'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import isEmail from 'validator/lib/isEmail'

import { useMe } from '@/lib/context/MeContext'
import { maybeDecode } from '@/lib/utils/base64u'
import { useTranslation } from '@/lib/withT'

import { LoginForm } from '.'

function LoginHeader() {
  const { t } = useTranslation()
  return (
    <div
      className={css({
        mb: '8-16',
        textAlign: 'center',
      })}
    >
      <h2>
        <Dialog.Title className={css({ mb: 4 })}>
          {t('loginPopup/title')}
        </Dialog.Title>
      </h2>
      <p
        className={css({ textStyle: 'airy' })}
        dangerouslySetInnerHTML={{
          __html: t('loginPopup/description'),
        }}
      />
    </div>
  )
}

function Login({ email }: { email: string }) {
  return (
    <Dialog.Root defaultOpen={true}>
      <Dialog.Portal>
        <Overlay>
          <div
            className={css({
              padding: 4,
              '& h2': {
                textStyle: 'h2Sans',
              },
            })}
          >
            <LoginForm
              context='signIn'
              renderBefore={<LoginHeader />}
              analyticsProps={{ variation: 'prefilled login popup' }}
              defaultEmail={email}
            />
          </div>
        </Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function LoginPopup() {
  const { meLoading, me } = useMe()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string>('')

  const emailParam = searchParams.get('email')

  useEffect(() => {
    if (emailParam) {
      const decodedEmail = maybeDecode(emailParam as string)
      if (isEmail(decodedEmail)) {
        setEmail(decodedEmail)
      }

      const newParams = new URLSearchParams(searchParams)
      newParams.delete('email')
      window.history.replaceState(null, '', `?${newParams.toString()}`)
    }
  }, [emailParam, searchParams])

  if (meLoading || me || !email) return null

  return (
    <EventTrackingContext category='SimplifiedLogin'>
      <Login email={email} />
    </EventTrackingContext>
  )
}
