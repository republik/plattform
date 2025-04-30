'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { ApolloError, useApolloClient } from '@apollo/client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { visuallyHidden, vstack } from '@republik/theme/patterns'
import { css } from '@republik/theme/css'

import {
  AuthorizeSessionDocument,
  RequestAccessDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useTranslation } from 'lib/withT'
import { REGWALL_CAMPAIGN } from 'lib/constants'
import { getConversionPayload } from 'lib/utils/conversion-payload'

import { Spinner } from '../../ui/spinner'

import { CodeInput } from './code-input'
import { ErrorMessage } from './error-message'
import { reloadPage, SignupContextType } from './utils'

export interface CodeFormProps {
  email: string
  context?: SignupContextType
  analyticsProps: Record<string, string>
  redirectUrl?: string
}

export function CodeForm({
  email,
  context,
  analyticsProps,
  redirectUrl,
}: CodeFormProps) {
  const codeId = useId()
  const router = useRouter()
  const { query } = router
  const trackEvent = useTrackEvent()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<ApolloError | undefined>()
  const [pending, setPending] = useState(false)

  const { t } = useTranslation()
  const gql = useApolloClient()

  useEffect(() => {
    if (formRef.current) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleErr = (err) => {
    setError(err)
    setPending(false)
    formRef.current?.reset()
  }

  const registerForTrial = () =>
    gql
      .mutate({
        mutation: RequestAccessDocument,
        variables: {
          campaignId: REGWALL_CAMPAIGN,
          payload: getConversionPayload(query),
        },
      })
      .then(() => {
        // console.log('trial registration success')
        trackEvent({
          action: 'Completely trial registration',
          ...analyticsProps,
        })
        reloadPage(context, redirectUrl)
      })
      .catch((err) => {
        // console.error('trial registration error', err)
        if (
          err.message.includes(
            'Sie haben bereits eine aktive Mitgliedschaft.',
          ) ||
          err.message.includes(
            'Es sieht so aus, als hätten Sie bereits eine kostenlose Gastwoche angefangen.',
          )
        ) {
          return reloadPage(undefined, redirectUrl)
        }
        handleErr(err)
      })

  const handleLoginSuccess = (res) => {
    // console.log({ context })
    if (context === 'trial') {
      registerForTrial()
    } else {
      reloadPage(undefined, redirectUrl)
    }
  }

  const submitForm = (formData: FormData) => {
    const email = formData.get('email') as string
    const code = (formData.get('code') as string)?.replace(/[^0-9]/g, '')
    const token = { type: SignInTokenType.EmailCode, payload: code }

    setPending(true)

    gql
      .mutate({
        mutation: AuthorizeSessionDocument,
        variables: {
          email,
          tokens: [token],
        },
      })
      .then(handleLoginSuccess)
      .catch(handleErr)
  }

  const submitCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (pending) {
      return
    }

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    submitForm(formData)
  }

  return (
    <form action='POST' onSubmit={submitCode} ref={formRef}>
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch ',
          w: 'full',
          maxW: 'lg',
          textAlign: 'center',
        })}
      >
        <h2>{t('auth/login/code/title')}</h2>
        <div className={css({ textStyle: 'airy' })}>
          <p>
            {t.elements('auth/login/code/description', {
              email: <b>{email}</b>,
            })}
          </p>
        </div>

        <input name='email' type='hidden' value={email} readOnly></input>

        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4',
            mt: '4',
          })}
        >
          <label htmlFor={codeId} className={visuallyHidden()}>
            Code
          </label>
          <CodeInput
            id={codeId}
            name='code'
            disabled={pending}
            inputMode='numeric'
            autoFocus
            onComplete={() => {
              // Safari < 16 doesn't support requestSubmit(), so we submit manually
              // formRef.current?.requestSubmit?.();
              if (formRef.current && !pending) {
                submitForm(new FormData(formRef.current))
              }
            }}
          />
          {error && <ErrorMessage error={error} />}
          <div
            // style={{ visibility: pending ? "visible" : "hidden" }}
            className={css({
              mt: '4',
              display: 'flex',
              alignItems: 'center',
              color: 'textSoft',
            })}
          >
            {pending ? (
              <>
                <Spinner />
                <b className={css({ pl: '4' })}>
                  {t('auth/login/code/pending')}
                </b>
              </>
            ) : (
              <span
                className={css({
                  fontSize: 's',
                  textAlign: 'center',
                  lineHeight: 1.4,
                })}
              >
                {t.elements('auth/login/code/help', {
                  changeEmail: (
                    <button
                      type='button' // Important, so this button isn't used to submit the form
                      onClick={() => window.location.reload()}
                      className={css({
                        textDecoration: 'underline',
                        display: 'inline-block',
                      })}
                    >
                      {t('auth/login/code/help/changeEmail')}
                    </button>
                  ),
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
