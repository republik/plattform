import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import ErrorMessage from '../ErrorMessage'
import withT from '../../lib/withT'
import { InlineSpinner, Radio, Label, Loader } from '@project-r/styleguide'
import { SUPPORTED_TOKEN_TYPES } from '../constants'
import { P } from './Elements'

const styles = {
  spinnerWrapper: css({
    display: 'inline-block',
    height: 0,
    marginLeft: 15,
    verticalAlign: 'middle',
    '& > span': {
      display: 'inline',
    },
  }),
  container: css({
    marginTop: 20,
  }),
}

class AuthSettings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mutating: false,
      serverError: null,
    }

    this.catchServerError = (error) => {
      this.setState(() => ({
        mutating: false,
        serverError: error,
      }))
    }
  }

  render() {
    const { t, authSettings, loading, error, updatePreferredFirstFactor } =
      this.props

    return (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { enabledFirstFactors, preferredFirstFactor } = authSettings
          const { mutating, serverError } = this.state

          return (
            <div {...styles.container}>
              <P style={{ marginBottom: 10 }}>
                {t('account/authSettings/firstfactor/label')}{' '}
                {mutating && (
                  <span {...styles.spinnerWrapper}>
                    <InlineSpinner size={24} />
                  </span>
                )}
              </P>
              {SUPPORTED_TOKEN_TYPES.map((tokenType) => {
                const disabled = enabledFirstFactors.indexOf(tokenType) === -1
                return (
                  <Fragment key={tokenType}>
                    <Radio
                      checked={tokenType === preferredFirstFactor}
                      disabled={mutating}
                      onChange={(_, checked) => {
                        this.setState((state) => ({
                          mutating: true,
                        }))
                        const finish = () => {
                          this.setState((state) => ({
                            mutating: false,
                          }))
                        }
                        updatePreferredFirstFactor({
                          tokenType,
                        })
                          .then(finish)
                          .catch(this.catchServerError)
                      }}
                    >
                      {t(`account/authSettings/firstfactor/${tokenType}/label`)}
                    </Radio>
                    <br />
                    {disabled && (
                      <Fragment>
                        <Label>
                          {t(
                            `account/authSettings/firstfactor/${tokenType}/disabled`,
                          )}
                        </Label>
                        <br />
                      </Fragment>
                    )}
                  </Fragment>
                )
              })}
              {serverError && <ErrorMessage error={serverError} />}
            </div>
          )
        }}
      />
    )
  }
}

const mutation = gql`
  mutation preferredFirstFactor($tokenType: SignInTokenType) {
    preferredFirstFactor(tokenType: $tokenType) {
      id
      enabledFirstFactors
      preferredFirstFactor
    }
  }
`

const query = gql`
  query myAuthSettings {
    authSettings: me {
      id
      enabledFirstFactors
      preferredFirstFactor
    }
  }
`

export default compose(
  graphql(mutation, {
    props: ({ mutate }) => ({
      updatePreferredFirstFactor: ({ tokenType }) =>
        mutate({
          variables: {
            tokenType,
          },
        }),
    }),
  }),
  graphql(query, {
    props: ({ data, errors }) => ({
      data,
      loading: data.loading || !data.authSettings,
      error: data.error,
      authSettings: data.loading ? undefined : data.authSettings,
    }),
  }),
  withT,
)(AuthSettings)
