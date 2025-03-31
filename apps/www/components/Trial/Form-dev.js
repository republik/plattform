import { useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql, withApollo } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import isEmail from 'validator/lib/isEmail'

import { withSignIn } from '../Auth/SignIn'
import { useTranslation } from '../../lib/withT'

import { getConversionPayload } from '../../lib/utils/conversion-payload'
import { TRIAL_CAMPAIGN } from '../../lib/constants'
import { useMe } from '../../lib/context/MeContext'
import { useRouter } from 'next/router'
import withAuthorizeSession from '../Auth/withAuthorizeSession'

const CODE_LENGTH = 6

const addStatusParamToRouter = (router) => (status) =>
  router.replace(
    {
      pathname: router.pathname,
      query: { ...router.query, trialSignup: status },
    },
    router.asPath,
    { shallow: true },
  )

const EmailForm = withSignIn(({ signIn, onSuccess, onError }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const [email, setEmail] = useState({
    value: '',
    error: null,
    dirty: false,
  })

  const setStatus = addStatusParamToRouter(router)

  const handleEmail = (value, shouldValidate) => {
    setEmail({
      ...email,
      value,
      error:
        ((!value || value.trim().length <= 0) &&
          t('Trial/Form/email/error/empty')) ||
        (!isEmail(value) && t('Trial/Form/email/error/invalid')),
      dirty: shouldValidate,
    })
  }

  const submitEmail = (e) => {
    e?.preventDefault()

    handleEmail(email.value, true)
    if (!email.value || email.error) return

    setStatus('pending')

    return signIn(
      email.value,
      'trial',
      ['PRIVACY'],
      'EMAIL_CODE',
      router.query.token,
    )
      .then(() => {
        setStatus('success')
        onSuccess(email.value)
      })
      .catch(onError)
  }

  return (
    <form onSubmit={submitEmail}>
      <input
        name='email'
        type='email'
        label={t('Trial/Form/email/label')}
        value={email.value}
        error={email.dirty && email.error}
        dirty={email.dirty}
        onChange={(_, value, shouldValidate) =>
          handleEmail(value, shouldValidate)
        }
      />
    </form>
  )
})

const CodeForm = withAuthorizeSession(
  ({ authorizeSession, email, onSuccess, onError }) => {
    const { t } = useTranslation()
    const [code, setCode] = useState({
      value: '',
      error: null,
      dirty: false,
    })

    const submitCode = (e) => {
      e?.preventDefault()

      authorizeSession({
        email,
        tokens: [{ type: 'EMAIL_CODE', payload: code.value }],
      })
        .then(onSuccess)
        .catch(onError)
    }

    const handleCode = ({ value = '', shouldValidate, t }) => {
      const newValue = value.replace(/[^0-9\s]/g, '').slice(0, CODE_LENGTH)
      setCode({
        value: newValue,
        error:
          (newValue.length === 0 && t('Auth/CodeAuthorization/code/missing')) ||
          (newValue.length < CODE_LENGTH &&
            t('Auth/CodeAuthorization/code/tooShort')),
        dirty: shouldValidate,
      })
      if (code.value && !code.value.error) {
        submitCode()
      }
    }

    return (
      <form onSubmit={submitCode}>
        <input
          pattern={'[0-9]*'}
          autoComplete='false'
          label={t('Auth/CodeAuthorization/code/label')}
          value={code.value}
          error={code.dirty && code.error}
          dirty={code.dirty}
          onChange={(_, value, shouldValidate) => {
            handleCode({ value, shouldValidate, t })
          }}
        />
      </form>
    )
  },
)

const AuthenticateAndRequestTrialForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('EMAIL') // EMAIL, CODE

  return (
    <>
      {step === 'EMAIL' && (
        <EmailForm
          onSuccess={(_email) => {
            setEmail(_email)
            setStep('CODE')
          }}
          onError={() => setStep('EMAIL')}
        />
      )}

      {step === 'CODE' && (
        <CodeForm
          email={email}
          onSuccess={onSuccess}
          onError={() => setStep('EMAIL')}
        />
      )}
    </>
  )
}

const RequestTrialForm = compose(
  withRequestAccess,
  withApollo,
)(({ requestAccess, onSuccess, client, payload }) => {
  const router = useRouter()
  const { query } = router

  const setStatus = addStatusParamToRouter(router)

  const requestTrialAccess = (e) => {
    e?.preventDefault()

    requestAccess({
      payload: { ...getConversionPayload(query), ...payload },
    }).then(() => {
      setStatus('success')
      client.resetStore()
      onSuccess()
    })
  }

  return (
    <form onSubmit={requestTrialAccess}>
      <button type='submit'>Get access</button>
    </form>
  )
})

const StarterPack = ({ context }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <>
      <button
        onClick={() =>
          router.push({
            pathname: '/einrichten',
            query: { context },
          })
        }
      >
        {t('Trial/Form/withAccess/setup/label')}
      </button>
      <button onClick={() => router.push('/')}>
        {t('Trial/Form/withAccess/button/label')}
      </button>
    </>
  )
}

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const Form = ({ payload, context = 'trial' }) => {
  const { me } = useMe()
  const [step, setStep] = useState('REQUEST') // REQUEST, SUCCESS

  const onSuccess = () => {
    setStep('SUCCESS')
  }

  return (
    <>
      {step === 'REQUEST' && !me && (
        <AuthenticateAndRequestTrialForm onSuccess={onSuccess} />
      )}
      {step === 'REQUEST' && me && (
        <RequestTrialForm onSuccess={onSuccess} payload={payload} />
      )}
      {step === 'SUCCESS' && <StarterPack context={context} />}
    </>
  )
}

const REQUEST_ACCESS = gql`
  mutation requestAccess($campaignId: ID!, $payload: JSON) {
    requestAccess(campaignId: $campaignId, payload: $payload) {
      id
      endAt
    }
  }
`

const withRequestAccess = graphql(REQUEST_ACCESS, {
  props: ({ mutate, ownProps: { accessCampaignId } }) => ({
    requestAccess: ({ payload }) =>
      mutate({
        variables: {
          campaignId: accessCampaignId || TRIAL_CAMPAIGN,
          payload,
        },
      }),
  }),
})

export default Form
