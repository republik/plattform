import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import isEmail from 'validator/lib/isEmail'

import Link from 'next/link'
import withT from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'

import {
  Button,
  InlineSpinner,
  Interaction,
  Field,
  Label,
  RawHtml,
  colors,
} from '@project-r/styleguide'

import Poller from './Poller'
import { withRouter } from 'next/router'
import { graphql } from '@apollo/client/react/hoc'

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
  }),
  input: css({
    marginRight: 10,
    marginBottom: 0,
    width: '58%',
    flexGrow: 1,
  }),
  button: css({
    width: 160,
    textAlign: 'center',
    marginBottom: 15,
  }),
  hint: css({
    marginTop: -5,
    color: colors.lightText,
    display: 'block',
    lineHeight: '20px',
  }),
  hintA: css({
    textDecoration: 'underline',
    color: colors.lightText,
    ':hover': {
      color: colors.text,
    },
  }),
}

const checkEmail = ({ value, shouldValidate, t }) => ({
  email: value,
  error:
    (value.trim().length <= 0 && t('signIn/email/error/empty')) ||
    (!isEmail(value) && t('signIn/email/error/invalid')),
  dirty: shouldValidate,
})

class SignIn extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...checkEmail({
        value: props.email || '',
        t: props.t,
      }),
      polling: false,
      loading: false,
      success: undefined,
    }

    this.onFormSubmit = (event) => {
      event.preventDefault()
      this.signIn()
    }

    this.signIn = (tokenType) => {
      const { loading, error, email } = this.state
      const { signIn, context, acceptedConsents } = this.props

      if (error) {
        this.setState(() => ({ dirty: true }))
        return
      }

      if (loading) {
        return
      }

      this.setState(() => ({ loading: true }))

      signIn(email, context, acceptedConsents, tokenType)
        .then(({ data }) => {
          this.setState(() => ({
            polling: true,
            loading: false,
            phrase: data.signIn.phrase,
            tokenType: data.signIn.tokenType,
            alternativeFirstFactors: data.signIn.alternativeFirstFactors,
          }))
        })
        .catch((e) => {
          this.setState(() => ({
            serverError: e,
            loading: false,
          }))
        })
    }
  }

  componentDidMount() {
    this.setState({ cookiesDisabled: !navigator.cookieEnabled })
  }

  render() {
    const { t, label, beforeForm } = this.props
    const {
      phrase,
      tokenType,
      alternativeFirstFactors,
      polling,
      loading,
      success,
      error,
      dirty,
      email,
      serverError,
    } = this.state

    if (polling) {
      return loading ? (
        <InlineSpinner size={26} />
      ) : (
        <Poller
          tokenType={tokenType}
          phrase={phrase}
          email={email}
          alternativeFirstFactors={alternativeFirstFactors}
          onCancel={() => {
            this.setState(() => ({
              polling: false,
            }))
          }}
          onTokenTypeChange={(altTokenType) => {
            this.signIn(altTokenType)
          }}
          onSuccess={(me) => {
            this.setState(() => ({
              polling: false,
              success: t('signIn/success', {
                nameOrEmail: me.name || me.email,
              }),
            }))
          }}
        />
      )
    }
    if (success) {
      return <span>{success}</span>
    }

    if (this.state.cookiesDisabled) {
      return (
        <Fragment>
          <ErrorMessage error={t('cookies/disabled/error')} />
          <RawHtml
            type={Interaction.P}
            dangerouslySetInnerHTML={{
              __html: t('cookies/disabled/error/explanation'),
            }}
          />
        </Fragment>
      )
    }

    return (
      <div>
        {beforeForm}
        <form onSubmit={this.onFormSubmit}>
          <div {...styles.form}>
            <div {...styles.input}>
              <Field
                name='email'
                type='email'
                label={t('signIn/email/label')}
                error={dirty && error}
                onChange={(_, value, shouldValidate) => {
                  this.setState(
                    checkEmail({
                      t,
                      value,
                      shouldValidate,
                    }),
                  )
                }}
                value={email}
              />
            </div>
            <div {...styles.button}>
              {loading ? (
                <InlineSpinner />
              ) : (
                <Button block type='submit' disabled={loading}>
                  {label || t('signIn/button')}
                </Button>
              )}
            </div>
          </div>
        </form>
        <Label {...styles.hint}>
          <Link href='/legal/privacy' {...styles.hintA}>
            {t('signIn/privacy')}
          </Link>
          {' – '}
          <Link href='/faq' {...styles.hintA}>
            {t('signIn/faq')}
          </Link>
          {' – '}
          {t('signIn/hint')}
        </Label>
        {!!serverError && <ErrorMessage error={serverError} />}
      </div>
    )
  }
}

SignIn.propTypes = {
  signIn: PropTypes.func.isRequired,
}

const signInMutation = gql`
  mutation signIn(
    $email: String!
    $context: String
    $consents: [String!]
    $tokenType: SignInTokenType
  ) {
    signIn(
      email: $email
      context: $context
      consents: $consents
      tokenType: $tokenType
    ) {
      phrase
      tokenType
      alternativeFirstFactors
    }
  }
`

export const withSignIn = graphql(signInMutation, {
  props: ({ mutate }) => ({
    signIn: (email, context = 'signIn', consents, tokenType) =>
      mutate({ variables: { email, context, consents, tokenType } }),
  }),
})

export default compose(withSignIn, withT, withRouter)(SignIn)
