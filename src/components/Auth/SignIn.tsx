import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Component, ComponentClass } from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { compose } from 'redux'
import withT from '../../lib/withT'
import { validate as isEmail } from 'email-validator'
import ErrorMessage from '../ErrorMessage'
import { InlineSpinner } from '../Spinner'
import RawHtml from '../RawHtml'

import {
  Button,
  Interaction,
  Field
} from '@project-r/styleguide'

import Poller from './Poller'

const { P } = Interaction

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap'
  }),
  input: css({
    marginRight: 10,
    marginBottom: 0,
    width: '58%',
    flexGrow: 1
  }),
  button: css({
    width: '38%',
    minWidth: 140,
    maxWidth: 160,
    textAlign: 'center'
  })
}

interface AnyObject {
  [key: string]: any
}

class SignIn extends Component<AnyObject, AnyObject> {
  public static propTypes = {
    signIn: PropTypes.func.isRequired
  }

  constructor(props: any) {
    super(props)
    this.state = {
      email: props.email || '',
      polling: false,
      loading: false,
      success: undefined
    }
  }
  public render() {
    const { t, label } = this.props
    const {
      polling,
      phrase,
      loading,
      success,
      error,
      dirty,
      email,
      serverError
    } = this.state
    if (polling) {
      return (
        <div>
          <RawHtml
            type={P}
            dangerouslySetInnerHTML={{
              __html: t('signIn/polling', {
                phrase,
                email
              })
            }}
          />
          <Poller
            onSuccess={(me: any, ms: any) => {
              this.setState(() => ({
                polling: false,
                success: t('signIn/success', {
                  nameOrEmail: me.name || me.email,
                  seconds: Math.round(ms / 1000)
                })
              }))
            }}
          />
        </div>
      )
    }
    if (success) {
      return (
        <span>
          {success}
        </span>
      )
    }
    return (
      <div>
        <div {...styles.form}>
          <div {...styles.input}>
            <Field
              name="email"
              type="email"
              label={t('signIn/email/label')}
              error={dirty && error}
              onChange={(
                _: any,
                value: any,
                shouldValidate: any
              ) => {
                this.setState(() => ({
                  email: value,
                  error:
                    (value.trim().length <= 0 &&
                      t('signIn/email/error/empty')) ||
                    (!isEmail(value) &&
                      t('signIn/email/error/invalid')),
                  dirty: shouldValidate
                }))
              }}
              value={email}
            />
          </div>
          <div {...styles.button}>
            {loading
              ? <InlineSpinner />
              : <Button
                  block
                  disabled={loading}
                  onClick={() => {
                    if (error) {
                      this.setState(() => ({
                        dirty: true
                      }))
                      return
                    }
                    if (loading) {
                      return
                    }
                    this.setState(() => ({
                      loading: true
                    }))
                    this.props
                      .signIn(email)
                      .then(({ data }: any) => {
                        this.setState(() => ({
                          polling: true,
                          loading: false,
                          phrase: data.signIn.phrase
                        }))
                      })
                      .catch((err: any) => {
                        this.setState(() => ({
                          serverError: err,
                          loading: false
                        }))
                      })
                  }}
                >
                  {label || t('signIn/button')}
                </Button>}
          </div>
        </div>
        {!!serverError &&
          <ErrorMessage error={serverError} />}
      </div>
    )
  }
}

const signInMutation = gql`
  mutation signIn($email: String!, $context: String) {
    signIn(email: $email, context: $context) {
      phrase
    }
  }
`

export const withSignIn = graphql(signInMutation, {
  props: ({ mutate }) => ({
    signIn: (email: any, context = 'signIn') => {
      if (mutate) {
        return mutate({ variables: { email, context } })
      }
    }
  })
})

const WrappedSignIn: ComponentClass<AnyObject> = compose(
  withSignIn,
  withT
)(SignIn)

export default WrappedSignIn
