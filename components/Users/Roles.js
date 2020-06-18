import { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { MdDone as SaveIcon } from 'react-icons/md'
import {
  Checkbox,
  Loader,
  InlineSpinner
} from '@project-r/styleguide'

import {
  InteractiveSection,
  SectionTitle,
  TextButton
} from '../Display/utils'

const ROLES = [
  'editor',
  'producer',
  'supporter',
  'accountant',
  'admin',
  'accomplice',
  'tester'
]

const GET_ROLES = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      roles
    }
  }
`

const REMOVE_USER_FROM_ROLE = gql`
  mutation removeUserFromRole(
    $userId: ID!
    $role: String!
  ) {
    removeUserFromRole(userId: $userId, role: $role) {
      id
    }
  }
`

const ADD_USER_TO_ROLE = gql`
  mutation addUserToRole($userId: ID!, $role: String!) {
    addUserToRole(userId: $userId, role: $role) {
      id
    }
  }
`

class UpdateRole extends Component {
  constructor(props) {
    super(props)
    const {
      role,
      user: { roles }
    } = this.props

    this.state = {
      initialValue: roles.includes(role),
      value: roles.includes(role)
    }

    this.handleSubmit = mutation => event => {
      event.preventDefault()
      mutation()
    }
  }

  render() {
    const {
      user: { id },
      role
    } = this.props
    const { value, initialValue } = this.state
    return (
      <Mutation
        mutation={
          value ? ADD_USER_TO_ROLE : REMOVE_USER_FROM_ROLE
        }
        variables={{ userId: id, role }}
        refetchQueries={() => [
          {
            query: GET_ROLES,
            variables: {
              id
            }
          }
        ]}
      >
        {(mutation, { loading }) => {
          return (
            <form onSubmit={this.handleSubmit(mutation)}>
              <p>
                <Checkbox
                  checked={value}
                  disabled={loading}
                  onChange={(_, checked) =>
                    this.setState({
                      value: checked
                    })
                  }
                >
                  {role.replace(
                    /(\w)\w*/,
                    (match, group) =>
                      `${group.toUpperCase()}${match.substr(
                        1
                      )}`
                  )}
                </Checkbox>
                <span style={{ float: 'right' }}>
                  {loading ? (
                    <InlineSpinner size={22} />
                  ) : initialValue !== value ? (
                    <TextButton type="submit">
                      <SaveIcon size={22} />
                    </TextButton>
                  ) : (
                    undefined
                  )}
                </span>
              </p>
            </form>
          )
        }}
      </Mutation>
    )
  }
}

export default ({ userId }) => {
  return (
    <Query query={GET_ROLES} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        const isInitialLoading =
          loading && !(data && data.user)
        return (
          <Loader
            loading={isInitialLoading}
            error={error}
            render={() => {
              const { user } = data

              return (
                <InteractiveSection>
                  <SectionTitle>Rollen</SectionTitle>
                  {ROLES.map(role => (
                    <UpdateRole
                      key={`${role}-${user.roles.includes(
                        role
                      )}`}
                      user={user}
                      role={role}
                    />
                  ))}
                </InteractiveSection>
              )
            }}
          />
        )
      }}
    </Query>
  )
}
