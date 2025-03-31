import { useRouter } from 'next/router'
import { useMutation } from '@apollo/client'

import {
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import isEmail from 'validator/lib/isEmail'
import { useTranslation } from 'lib/withT'

import { addStatusParamToRouter } from './utils'
import { css } from '@republik/theme/css'

const TrialEmailForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const [signIn] = useMutation(SignInDocument)
  const setStatus = addStatusParamToRouter(router)

  const signInWithEmail = (email) =>
    signIn({
      variables: {
        email,
        context: 'trial',
        consents: ['PRIVACY'],
        tokenType: 'EMAIL_CODE' as SignInTokenType,
      },
    })
      .then(() => {
        setStatus('success')
        onSuccess(email)
      })
      .catch(onError)

  const submitEmail = (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const email = formData.get('email')?.toString().trim()

    if (!isEmail(email)) {
      console.error(t('Trial/Form/email/error/invalid'))
      return
    }

    setStatus('pending') // TODO: move to a context?
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

export default TrialEmailForm
