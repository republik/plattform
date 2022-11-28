import { useState, useEffect } from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { graphql, withApollo } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'
import isEmail from 'validator/lib/isEmail'
import { format } from 'url'

import ErrorMessage from '../ErrorMessage'
import { withSignIn } from '../Auth/SignIn'
import withMembership from '../Auth/withMembership'
import SwitchBoard from '../Auth/SwitchBoard'
import Consents, { getConsentsError } from '../Pledge/Consents'
import withMe from '../../lib/apollo/withMe'
import withT from '../../lib/withT'

import { ArrowForwardIcon, plainButtonRule } from '@project-r/styleguide'
import {
  Button,
  Field,
  InlineSpinner,
  useColorContext,
  Interaction,
  RawHtml,
  A,
} from '@project-r/styleguide'
import { withRouter } from 'next/router'
import { getConversionPayload } from '../../lib/utils/track'
import { TRIAL_CAMPAIGN } from '../../lib/constants'

const styles = {
  errorMessages: css({
    marginTop: 40,
  }),
  switchBoard: css({
    marginTop: 40,
  }),
  switchBoardMinimal: css({
    marginTop: 0,
  }),
  completeContainer: css({
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    alignItems: 'center',
    '> *': {
      marginBottom: 16,
    },
  }),
  circleButton: css(plainButtonRule, {
    padding: 4,
    borderRadius: '50%',
    lineHeight: 0,
  }),
}

const REQUIRED_CONSENTS = ['PRIVACY']

const Form = (props) => {
  const {
    payload,
    router,
    showTitleBlock,
    onBeforeSignIn,
    onSuccess,
    onReset,
    narrow,
    isMember,
    me,
    client,
    t,
    minimal,
    initialEmail,
    campaign,
    isInSeriesNav,
    black,
  } = props
  const { query } = router

  const [consents, setConsents] = useState(query.token ? REQUIRED_CONSENTS : [])
  const [email, setEmail] = useState({ value: initialEmail || '' })
  const [serverError, setServerError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [loading, setLoading] = useState(false)

  const [switchBoardProps, setSwitchBoardProps] = useState()

  const [showErrors, setShowErrors] = useState(false)
  const [autoRequestAccess, setAutoRequestAccess] = useState(false)
  const [colorScheme] = useColorContext()

  useEffect(() => {
    autoRequestAccess && !isSigningIn && me && requestAccess()
  }, [autoRequestAccess, isSigningIn])

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

  const requestAccess = (e) => {
    e && e.preventDefault && e.preventDefault()

    setLoading(true)
    setAutoRequestAccess(false)
    setServerError()

    if (!me) {
      handleEmail(email.value, true)

      if (!email.value || email.error || consentErrors) {
        setLoading(false)
        return setShowErrors(true)
      }

      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, trialSignup: 'pending' },
        },
        router.asPath,
        { shallow: true },
      )
      if (onBeforeSignIn) {
        onBeforeSignIn()
      }

      return props
        .signIn(email.value, 'trial', consents, 'EMAIL_CODE', query.token)
        .then(({ data: { signIn } }) => {
          setSwitchBoardProps({
            ...signIn,
            accessToken: query.token,
          })

          setLoading(false)
          setIsSigningIn(true)
          setAutoRequestAccess(true)
        })
        .catch(catchError)
    }

    setIsSigningIn(false)

    if (!isMember) {
      props
        .requestAccess({
          payload: { ...getConversionPayload(query), ...payload },
        })
        .then(() => {
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, trialSignup: 'success' },
            },
            router.asPath,
            { shallow: true },
          )
          const shouldRedirect = onSuccess ? onSuccess() : true
          if (shouldRedirect) {
            window.location = format({
              pathname: `/einrichten`,
              query: { context: 'trial' },
            })
          } else {
            minimal && setShowButtons(true)
            client.resetStore()
          }
        })
        .catch(catchError)
    }
  }

  const catchError = (error) => {
    setServerError(error)
    reset()
  }

  const reset = (e) => {
    e && e.preventDefault && e.preventDefault()

    setLoading(false)
    setIsSigningIn(false)
    onReset && onReset()
  }

  const close = (e) => {
    e && e.preventDefault && e.preventDefault()
    // remove trialSignup from router query
    const { trialSignup: _, ...newQuery } = router.query
    router.replace(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      router.asPath,
      { shallow: true },
    )
  }

  const onSuccessSwitchBoard = () => {
    setIsSigningIn(false)
  }

  const isComplete = showButtons || isMember

  const titleBlock = showTitleBlock && (
    <>
      <Interaction.H2 style={{ marginBottom: 10 }}>
        <RawHtml
          dangerouslySetInnerHTML={{
            __html: t(
              `Trial/Form/${
                isComplete ? 'completed' : isSigningIn ? 'waiting' : 'initial'
              }/title`,
            ),
          }}
        />
      </Interaction.H2>
      {!isSigningIn && (
        <Interaction.P>
          {t(
            `Trial/Form/initial/${isComplete ? 'afterSignIn' : 'beforeSignIn'}`,
          )}
        </Interaction.P>
      )}
    </>
  )

  if (isComplete) {
    return (
      <>
        {titleBlock}
        <div
          style={{
            marginTop: narrow || minimal ? 20 : 40,
            marginBottom: !isInSeriesNav && minimal ? 10 : undefined,
          }}
          {...styles.completeContainer}
        >
          {isInSeriesNav ? (
            <>
              <Interaction.P>
                <Link href='/einrichten' passHref>
                  <A>{t('Trial/Form/withAccess/setup/label')}</A>
                </Link>
              </Interaction.P>

              <Button
                primary
                black={black}
                onClick={close}
                style={{ marginRight: 20 }}
              >
                {t('Trial/Form/withAccess/close/label')}
              </Button>
            </>
          ) : (
            <>
              <Button
                black={black}
                onClick={() =>
                  router.push({
                    pathname: '/einrichten',
                    query: { context: 'trial' },
                  })
                }
              >
                {t('Trial/Form/withAccess/setup/label')}
              </Button>
              <Button
                black={black}
                primary
                style={{ marginRight: 20 }}
                onClick={() => router.push('/')}
              >
                {t('Trial/Form/withAccess/button/label')}
              </Button>
            </>
          )}
        </div>
      </>
    )
  }

  const consentErrors = getConsentsError(t, REQUIRED_CONSENTS, consents)
  const errorMessages = [email.error].concat(consentErrors).filter(Boolean)

  return (
    <>
      {titleBlock}
      {!(isSigningIn && minimal) && (
        <form onSubmit={requestAccess}>
          {!me && (
            <div
              style={{
                opacity: isSigningIn ? 0.6 : 1,
                marginTop: narrow || minimal ? 0 : 20,
              }}
            >
              <Field
                name='email'
                type='email'
                label={t('Trial/Form/email/label')}
                value={email.value}
                error={email.dirty && email.error}
                dirty={email.dirty}
                disabled={isSigningIn}
                black={black}
                icon={
                  minimal &&
                  (loading ? (
                    <InlineSpinner size='30px' />
                  ) : (
                    <button
                      {...css(
                        styles.circleButton,
                        !!email.value &&
                          !email.error &&
                          colorScheme.set(
                            'backgroundColor',
                            black ? 'text' : 'primary',
                          ),
                      )}
                    >
                      <ArrowForwardIcon
                        style={{ cursor: 'pointer' }}
                        size={22}
                        onClick={requestAccess}
                        {...colorScheme.set('fill', 'text')}
                      />
                    </button>
                  ))
                }
                onChange={(_, value, shouldValidate) =>
                  handleEmail(value, shouldValidate)
                }
              />
              <div
                style={{ marginTop: (narrow && 10) || (minimal && '0') || 20 }}
              >
                <Consents
                  black={black}
                  error={showErrors && consentErrors}
                  required={REQUIRED_CONSENTS}
                  accepted={consents}
                  disabled={isSigningIn}
                  onChange={setConsents}
                />
              </div>
            </div>
          )}

          {!minimal && showErrors && errorMessages.length > 0 && (
            <div
              {...styles.errorMessages}
              {...colorScheme.set('color', 'error')}
            >
              {t('Trial/Form/error/title')}
              <br />
              <ul>
                {errorMessages.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {!isSigningIn && (!minimal || me) && (
            <div style={{ marginTop: narrow || minimal ? 20 : 30 }}>
              {loading ? (
                <InlineSpinner />
              ) : (
                <Button
                  primary
                  type='submit'
                  onClick={requestAccess}
                  disabled={showErrors && errorMessages.length > 0}
                >
                  {t.first(
                    [
                      campaign &&
                        me &&
                        `Trial/Form/${campaign}/button/signedIn`,
                      campaign && `Trial/Form/${campaign}/button`,
                      me && `Trial/Form/button/signedIn`,
                      `Trial/Form/button`,
                    ].filter(Boolean),
                  )}
                </Button>
              )}
            </div>
          )}
        </form>
      )}

      {isSigningIn && (
        <div
          {...merge(styles.switchBoard, minimal && styles.switchBoardMinimal)}
        >
          <SwitchBoard
            email={email.value}
            {...switchBoardProps}
            alternativeFirstFactors={[]}
            onCancel={reset}
            onTokenTypeChange={reset}
            onSuccess={onSuccessSwitchBoard}
            minimal={minimal}
          />
        </div>
      )}

      {serverError && <ErrorMessage error={serverError} />}
    </>
  )
}

Form.propTypes = {
  campaign: PropTypes.string,
  accessCampaignId: PropTypes.string,
  onBeforeSignIn: PropTypes.func,
  narrow: PropTypes.bool,
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

export default compose(
  withMembership,
  withRequestAccess,
  withSignIn,
  withRouter,
  withMe,
  withT,
  withApollo,
)(Form)
