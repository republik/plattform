import { useMutation } from '@apollo/client'

import {
  MeDocument,
  AuthorizeSessionDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useTranslation } from 'lib/withT'

const CODE_LENGTH = 6

const TrialCodeForm = ({ email, onSuccess, onError }) => {
  const { t } = useTranslation()
  const [authorizeSession] = useMutation(AuthorizeSessionDocument, {
    refetchQueries: [{ query: MeDocument }],
    awaitRefetchQueries: true,
  })

  const submitCode = (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const code = formData.get('code')?.toString().trim()

    if (!code || code.length === 0) {
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
      <input type='text' pattern={'[0-9]*'} name='code' autoComplete='false' />
    </form>
  )
}

export default TrialCodeForm
