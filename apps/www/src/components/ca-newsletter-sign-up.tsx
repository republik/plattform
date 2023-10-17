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
import { useState } from 'react'
import { wrap } from '@app/styled-system/patterns'

const formSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail Adresse ein.'),
})

type FormValues = z.infer<typeof formSchema>

type CANewsletterSignUpProps = {
  defaultEmail?: string
}

export function CANewsletterSignUp({
  defaultEmail = '',
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
      email: defaultEmail,
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
    <div
      className={css({
        pt: '12',
      })}
    >
      <h2
        className={css({
          mb: '4',
          fontSize: '3xl',
          fontWeight: 'bold',
        })}
        style={{
          letterSpacing: '-1px',
        }}
      >
        Für den Newsletter anmelden
      </h2>
      {!signUpSuccessful ? (
        <form
          className={wrap({
            gap: '2',
            position: 'relative',
            pb: '8',
          })}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <input
            className={css({
              fontSize: 'xl',
              flexGrow: 1,
              background: 'transparent',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
              borderBottomColor: 'text',
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
            type='email'
            placeholder='Email'
          />
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
      ) : (
        <p
          className={css({
            fontSize: 'xl',
          })}
        >
          Sie sollten eine E-Mail erhalten haben, um die Anmeldung für den
          Newsletter zu bestätigen. ✅
        </p>
      )}
    </div>
  )
}
