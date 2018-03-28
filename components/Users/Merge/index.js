import React, { Component } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import {
  colors,
  Field,
  Interaction,
  Button,
  Label
} from '@project-r/styleguide'
import ErrorMessage from '../../ErrorMessage'

import { validate as isEmail } from 'email-validator'
import routes from '../../../server/routes'
const { Link } = routes

const interactiveStyles = {
  cursor: 'pointer'
}

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
})

const findUserQuery = gql`
  query users($email: String!) {
    users: adminUsers(limit: 1, search: $email) {
      items {
        id
        email
        name
      }
    }
  }
`

const mergeUsersMutation = gql`
  mutation mergeUsers(
    $sourceId: ID!
    $targetId: ID!
  ) {
    mergeUsers(
      sourceUserId: $sourceId
      targetUserId: $targetId
    ) {
      id
      email
    }
  }
`

const CheckIcon = () => (
  <span>
    <svg
      fill={colors.primary}
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  </span>
)

class MergeUsers extends Component {
  constructor(props) {
    super(props)
    this.state = { errors: null }
  }

  handleUserResponse = userType => response => {
    if (response.data.users.items.length === 1) {
      this.setState(() => ({
        [`${userType}User`]: response.data.users
          .items[0]
      }))
    }
  }

  findUser = (userType: string) => (
    e,
    value: string
  ) => {
    this.setState(() => ({
      [`${userType}Email`]: value
    }))

    if (isEmail(value)) {
      const { client } = this.context
      if (client) {
        client
          .query({
            query: findUserQuery,
            variables: { email: value }
          })
          .then(this.handleUserResponse(userType))
          .catch(error =>
            this.setState({
              errors: error
            })
          )
      }
    }
  }

  handleMergeResponse = response => {
    this.setState(() => ({
      sourceUser: null,
      targetUser: null,
      mergedUser: response.data.mergeUsers
    }))
  }

  mergeUsers = () => {
    const { client } = this.context
    const { sourceUser, targetUser } = this.state
    if (sourceUser && targetUser) {
      if (
        confirm(`Willst du wirklich den Account ${
          sourceUser.email
        }
         mit dem Account ${
           targetUser.email
         } zusammenführen?`)
      ) {
        client
          .mutate({
            mutation: mergeUsersMutation,
            variables: {
              sourceId: sourceUser.id,
              targetId: targetUser.id
            }
          })
          .then(this.handleMergeResponse)
          .catch(error =>
            this.setState({
              errors: error
            })
          )
      }
    }
  }

  componentWillReceiveProps() {
    this.state = { errors: {} }
  }

  render() {
    const {
      errors,
      sourceUser,
      targetUser,
      sourceEmail,
      targetEmail,
      mergedUser
    } = this.state

    return (
      <div>
        <Interaction.H3>
          Users zusammenführen
        </Interaction.H3>
        {errors && (
          <ErrorMessage error={errors} />
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '120px'
          }}
        >
          <div style={{ flex: '50%' }}>
            <div
              style={{
                display: 'inline-block',
                width: '90%'
              }}
            >
              <Field
                label="Email Quelle"
                value={sourceEmail}
                onChange={this.findUser('source')}
              />
            </div>
            {sourceUser && <CheckIcon />}
            <br />
            {sourceUser && (
              <Label>
                {sourceUser.name},{' '}
                {sourceUser.email}
              </Label>
            )}
          </div>
          <div style={{ flex: '50%' }}>
            <div
              style={{
                display: 'inline-block',
                width: '90%'
              }}
            >
              <Field
                label="Email Ziel"
                value={targetEmail}
                onChange={this.findUser('target')}
              />
            </div>
            {targetUser && <CheckIcon />}
            <br />
            {targetUser && (
              <Label>
                {targetUser.name},{' '}
                {targetUser.email}
              </Label>
            )}
          </div>
        </div>
        <Button
          primary
          disabled={!sourceUser || !targetUser}
          onClick={this.mergeUsers}
        >
          Zusammenführen
        </Button>
        {mergedUser && (
          <div style={{ marginTop: '30px' }}>
            Prima! Die Accounts wurden zusammen
            geführt. <br />
            <Link
              route="user"
              params={{ userId: mergedUser.id }}
            >
              <a
                className={`${link}`}
                style={interactiveStyles}
              >
                Zum neuen User-Profil
              </a>
            </Link>
          </div>
        )}
      </div>
    )
  }
}

MergeUsers.contextTypes = {
  client: PropTypes.object
}

export default MergeUsers
