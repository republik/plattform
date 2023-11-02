'use client'

import { useMutation } from '@apollo/client'
import {
  SIGN_UP_FOR_NEWSLETTER_MUTATION,
  SignUpForNewsletterResult,
  SignUpForNewsletterVariables,
} from '@app/graphql/republik-api/newsletter.mutation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { css } from '@app/styled-system/css'
import { ReactNode, useState } from 'react'
import { stack, wrap } from '@app/styled-system/patterns'
import { MeQueryResult } from '@app/graphql/republik-api/me.query'

const formSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail Adresse ein.'),
})

type FormValues = z.infer<typeof formSchema>

type CANewsletterSignUpProps = {
  me?: MeQueryResult['me']
  // Override the default heading
  title?: string
  // Text that is shown between the heading & the form
  description?: ReactNode
}

export function CANewsletterSignUp({
  me,
  title,
  description,
}: CANewsletterSignUpProps) {
  const [signUpForNewsletter] = useMutation<
    SignUpForNewsletterResult,
    SignUpForNewsletterVariables
  >(SIGN_UP_FOR_NEWSLETTER_MUTATION)
  const [isLoading, setIsLoading] = useState(false)
  const [signUpSuccessful, setSignUpSuccessful] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: me?.email,
    },
  })

  async function handleSubmit({ email }: FormValues) {
    setIsLoading(true)
    try {
      const { data } = await signUpForNewsletter({
        variables: {
          name: 'CLIMATE', // TODO: check if correct newsletter
          email: email,
          context: '',
        },
      })
      if (!data.requestNewsletterSubscription) {
        throw new Error('Error signing up for newsletter')
      }
      setSignUpSuccessful(true)
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
    <div>
      <h2
        className={css({
          mb: '4',
          textStyle: 'h1Sans',
          fontWeight: 'bold',
        })}
        style={{
          letterSpacing: '-1px',
        }}
      >
        {title || 'Für den Newsletter anmelden'}
      </h2>
      {description}
      {!signUpSuccessful ? (
        <>
          {me ? (
            <button
              className={css({
                position: 'relative',
                px: '8',
                py: '2',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'contrast',
                fontWeight: 'bold',
                fontSize: 'xl',
                cursor: 'pointer',
                color: 'text',
                width: '100%',
                md: {
                  width: 'auto',
                },
              })}
              onClick={() => {
                handleSubmit({ email: me.email })
              }}
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
                  pb: '8',
                })}
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div
                  className={css({
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                  })}
                >
                  <div
                    className={stack({
                      gap: '2',
                      width: 'full',
                    })}
                  >
                    <label
                      htmlFor='email-field'
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
                      id='email-field'
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
                </div>
                <button
                  className={css({
                    position: 'relative',
                    px: '8',
                    py: '2',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: 'contrast',
                    fontWeight: 'bold',
                    fontSize: 'xl',
                    cursor: 'pointer',
                    color: 'text',
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
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
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
        </>
      ) : (
        <p
          className={css({
            fontSize: 'xl',
          })}
        >
          Sie haben sich für den Newsletter angemeldet. ✅
        </p>
      )}
    </div>
  )
}
