'use client'

import { useMutation } from '@apollo/client'
import {
  MeQuery,
  NewsletterName,
  SignUpForNewsletterDocument,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'
import { css } from '@republik/theme/css'
import { stack, wrap } from '@republik/theme/patterns'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactNode, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
})

type FormValues = z.infer<typeof formSchema>

type EmailSignUpProps = {
  me: MeQuery['me']
  // Override the default heading
  title?: string
  // Text that is shown between the heading & the form
  description?: React.ReactNode
  // Tagline below the form
  tagline?: string
  newsletterName: NewsletterName
  newsletterSetting?: { id: string; name: string; subscribed: boolean }
  id?: string
  children?: ReactNode
}

export function EmailSignUp({
  me,
  title,
  description,
  tagline,
  newsletterName,
  newsletterSetting,
  id,
  children,
}: EmailSignUpProps) {
  const fieldId = useId()
  const [signUpForNewsletter] = useMutation(SignUpForNewsletterDocument)
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [signUpSuccessfulText, setSignUpSuccessfulText] = useState<
    string | null
  >()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: me?.email,
    },
  })

  const trackEvent = useTrackEvent()

  // enable subscription if user is logged in and not subscribed
  async function enableSubscription() {
    try {
      setIsLoading(true)
      await updateNewsletterSubscription({
        variables: {
          name: newsletterName,
          subscribed: true,
        },
      })
      setSignUpSuccessfulText(
        'Sie haben sich für den Newsletter angemeldet. ✅',
      )
      trackEvent({ action: 'newsletterSignupMember' })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handle subscribing to a given email address
   */
  async function handleSubmit({ email }: FormValues) {
    setIsLoading(true)
    try {
      const { data } = await signUpForNewsletter({
        variables: {
          name: newsletterName,
          email: email,
          context: '',
        },
      })
      if (!data.requestNewsletterSubscription) {
        throw new Error('Error signing up for newsletter')
      }
      setSignUpSuccessfulText(
        'Wir haben Ihnen eine E-Mail geschickt, um die Anmeldung für den Newsletter zu bestätigen. ✅',
      )
      trackEvent({ action: 'newsletterSignupEmail' })
    } catch (error) {
      console.error(error)
      form.setError(
        'email',
        {
          message:
            'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.',
        },
        { shouldFocus: true },
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      id={id}
      className={css({
        fontSize: '2xl',
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
      })}
    >
      {description && <p>{description}</p>}
      <h2
        className={css({
          // mb: '6',
          // textStyle: 'h1Sans',
          fontWeight: 'bold',
        })}
      >
        {title || 'Für den Newsletter anmelden'}
      </h2>
      {!signUpSuccessfulText ? (
        <>
          {me && newsletterSetting?.subscribed === false ? (
            <button
              className={css({
                position: 'relative',
                px: '8',
                py: '3',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'contrast',
                fontWeight: 'bold',
                fontSize: 'xl',
                cursor: 'pointer',
                color: 'contrast',
                width: '100%',
                md: {
                  width: 'auto',
                },
              })}
              onClick={() => enableSubscription()}
            >
              <span
                className={css({
                  visibility: isLoading ? 'hidden' : 'visible',
                })}
              >
                Abonnieren
              </span>
              {isLoading && (
                <div
                  className={css({
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  Lädt...
                </div>
              )}
            </button>
          ) : (
            <>
              <form
                className={wrap({
                  gap: '2',
                  position: 'relative',
                })}
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div
                  className={stack({
                    gap: '2',
                    flexGrow: 1,
                  })}
                >
                  <label
                    htmlFor={fieldId}
                    className={css({
                      display: 'flex',
                      flexDirection: 'row',
                      color: 'contrast',
                      fontSize: 'sm',
                    })}
                  >
                    E-Mail-Adresse
                  </label>
                  <input
                    id={fieldId}
                    className={css({
                      alignSelf: 'flex-end',
                      width: 'full',
                      fontSize: 'xl',
                      background: 'transparent',
                      borderBottomWidth: 1,
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'text',
                      borderRadius: 0,
                      color: 'text',
                      '&:focus': {
                        borderBottomColor: 'contrast',
                        outlineWidth: 0,
                      },
                      '&::placeholder': {
                        color: 'text',
                      },
                    })}
                    {...form.register('email')}
                  />
                </div>
                <button
                  className={css({
                    position: 'relative',
                    px: '8',
                    py: '3',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: 'contrast',
                    fontWeight: 'bold',
                    fontSize: 'xl',
                    cursor: 'pointer',
                    color: 'contrast',
                    width: '100%',
                    md: {
                      width: 'auto',
                    },
                  })}
                  type='submit'
                >
                  <span
                    className={css({
                      visibility: isLoading ? 'hidden' : 'visible',
                    })}
                  >
                    Abonnieren
                  </span>
                  {isLoading && (
                    <div
                      className={css({
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      Lädt...
                    </div>
                  )}
                </button>
                {form.formState.errors.email && (
                  <p
                    className={css({
                      width: 'full',
                      fontSize: 'sm',
                      color: 'error',
                    })}
                  >
                    {form.formState.errors.email.message}
                  </p>
                )}
              </form>
            </>
          )}

          <div>{children}</div>
        </>
      ) : (
        <p
          className={css({
            fontSize: 'xl',
          })}
        >
          {signUpSuccessfulText}
        </p>
      )}
    </div>
  )
}
