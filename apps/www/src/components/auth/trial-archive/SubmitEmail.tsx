import { useMutation } from '@apollo/client'

import {
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import isEmail from 'validator/lib/isEmail'
import { useTranslation } from 'lib/withT'

import { css } from '@republik/theme/css'

type SubmitEmailProps = {
  onSuccess: (email: string) => void
  onError: (error?: Error) => void
}

const SubmitEmail = ({ onSuccess, onError }: SubmitEmailProps) => {
  const { t } = useTranslation()
  const [signIn] = useMutation(SignInDocument)

  const signInWithEmail = (email: string) =>
    signIn({
      variables: {
        email,
        context: 'trial',
        consents: ['PRIVACY'],
        tokenType: 'EMAIL_CODE' as SignInTokenType,
      },
    })
      .then(() => {
        onSuccess(email)
      })
      .catch(onError)

  const submitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email')?.toString().trim()

    if (!isEmail(email)) {
      console.error(t('Trial/Form/email/error/invalid'))
      return
    }

    return signInWithEmail(email)
  }

  return (
    <form action='POST' onSubmit={submitEmail}>
      <label htmlFor='email'>Email</label>
      <input
        name='email'
        type='email'
        className={css({
          border: '1px solid #ccc',
        })}
      />
      <button type='submit' className={css({ color: 'blue' })}>
        Submit
      </button>
    </form>
  )
}

export default SubmitEmail
