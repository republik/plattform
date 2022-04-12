import { Component, Fragment } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { InlineSpinner, Loader, Radio } from '@project-r/styleguide'

import { InteractiveSection, SectionTitle } from '../Display/utils'

import withT from '../../lib/withT'

import { SUPPORTED_TOKEN_TYPES } from '../constants'

export const firstFactorFragment = gql`
  fragment FirstFactors on User {
    enabledFirstFactors
    preferredFirstFactor
  }
`

export const UPDATE_PREFERRED_FRIST_FACTOR = gql`
  mutation updatePreferredFirstFactor(
    $userId: ID!
    $tokenType: SignInTokenType!
  ) {
    preferredFirstFactor(userId: $userId, tokenType: $tokenType) {
      id
      ...FirstFactors
    }
  }
  ${firstFactorFragment}
`

export const GET_AUTH_SETTINGS = gql`
  query getAuthSettings($userId: String) {
    user(slug: $userId) {
      id
      ...FirstFactors
    }
  }
  ${firstFactorFragment}
`

class UpdatePreferredFirstFactor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: this.props.user.preferredFirstFactor,
    }
  }

  render() {
    const {
      user: { id: userId, enabledFirstFactors, preferredFirstFactor },
      t,
    } = this.props

    return (
      <Mutation
        mutation={UPDATE_PREFERRED_FRIST_FACTOR}
        variables={{ userId, tokenType: this.state.value }}
      >
        {(mutation, { loading }) => {
          return (
            <InteractiveSection>
              {loading && (
                <span style={{ float: 'right' }}>
                  <InlineSpinner size={32} />
                </span>
              )}
              <SectionTitle>Bevorzugte Anmeldeart</SectionTitle>
              <form>
                {SUPPORTED_TOKEN_TYPES.map((tokenType) => {
                  const disabled = !enabledFirstFactors.includes(tokenType)

                  return (
                    <Fragment key={tokenType}>
                      <Radio
                        checked={tokenType === preferredFirstFactor}
                        disabled={disabled || loading}
                        onChange={() => {
                          this.setState({ value: tokenType }, mutation)
                        }}
                      >
                        {t(
                          `account/authSettings/firstfactor/${tokenType}/label`,
                        )}
                      </Radio>
                      <br />
                    </Fragment>
                  )
                })}
              </form>
            </InteractiveSection>
          )
        }}
      </Mutation>
    )
  }
}

const AuthSettings = ({ t, userId }) => (
  <Query query={GET_AUTH_SETTINGS} variables={{ userId }}>
    {({ data, loading, error }) => (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { user } = data

          return <UpdatePreferredFirstFactor user={user} t={t} />
        }}
      />
    )}
  </Query>
)

export default withT(AuthSettings)
