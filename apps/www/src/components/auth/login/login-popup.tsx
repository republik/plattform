'use client'

import { Button } from '@app/components/ui/button'
import { Overlay } from '@app/components/ui/overlay'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import * as Dialog from '@radix-ui/react-dialog'

import { css } from '@republik/theme/css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import isEmail from 'validator/lib/isEmail'

import { useMe } from '../../../../lib/context/MeContext'
import { maybeDecode } from '../../../../lib/utils/base64u'
import { useTranslation } from '../../../../lib/withT'

import { LoginForm } from '../login'

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

function ResetButton({ onClick }) {
  const { t } = useTranslation()
  return (
    <div
      className={css({
        marginTop: 2,
        fontSize: 's',
        lineHeight: 1.4,
        color: 'textSoft',
        textAlign: 'center',
      })}
    >
      <Button variant='link' size='large' onClick={onClick}>
        {t('loginPopup/resetButton')}
      </Button>
    </div>
  )
}

function Login({ email }: { email: string }) {
  const [defaultEmail, setDefaultEmail] = useState<string>(email)
  const [autofocus, setAutofocus] = useState<boolean>(false)

  function resetEmail() {
    setDefaultEmail('')
    setAutofocus(true)
  }

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
              renderAfter={<ResetButton onClick={resetEmail} />}
              analyticsProps={{ variation: 'prefilled login popup' }}
              defaultEmail={defaultEmail}
              autoFocus={autofocus}
              key={defaultEmail} // reset form when email is changed
            />
          </div>
        </Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function LoginPopup() {
  const { meLoading, me } = useMe()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    if (router.isReady && router.query.email) {
      const { email: emailParam, ...restQuery } = router.query

      const decodedEmail = maybeDecode(emailParam as string)
      if (isEmail(decodedEmail)) {
        setEmail(decodedEmail)
      }

      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true },
      )
    }
  }, [router.isReady, router.query.email, router])

  if (meLoading || me || !email) return null

  return (
    <EventTrackingContext category='SimplifiedLogin'>
      <Login email={email} />
    </EventTrackingContext>
  )
}
