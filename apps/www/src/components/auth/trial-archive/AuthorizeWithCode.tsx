import { useMutation } from '@apollo/client'

import {
  AuthorizeSessionDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useTranslation } from 'lib/withT'

const CODE_LENGTH = 6

type AuthorizeWithCodeProps = {
  email: string
  onSuccess: () => void
  onError: (error?: Error) => void
}

const AuthorizeWithCode = ({
  email,
  onSuccess,
  onError,
}: AuthorizeWithCodeProps) => {
  const { t } = useTranslation()
  const [authorizeSession] = useMutation(AuthorizeSessionDocument)

  const submitCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const code = formData.get('code')?.toString().trim()

    if (!code.length) {
      console.log(t('Auth/CodeAuthorization/code/missing'))
      return
    }

    if (code.length < CODE_LENGTH) {
      console.log(t('Auth/CodeAuthorization/code/tooShort'))
      return
    }

    authorizeSession({
      variables: {
        email,
        tokens: [{ type: 'EMAIL_CODE' as SignInTokenType, payload: code }],
      },
    })
      .then(onSuccess)
      .catch(onError)
  }

  return (
    <form action='POST' onSubmit={submitCode}>
      <label htmlFor='code'>{t('Auth/CodeAuthorization/code/label')}</label>
      <input
        type='text'
        pattern={'[0-9]*'}
        name='code'
        autoComplete='false'
        onChange={(e) => e.target.form.submit()}
      />
    </form>
  )
}

export default AuthorizeWithCode
