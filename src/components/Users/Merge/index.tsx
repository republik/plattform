import * as React from 'react'
import { css } from 'glamor'
import { compose } from 'redux'
import * as PropTypes from 'prop-types'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import {
  colors,
  Field,
  Interaction,
  Button,
  Label
} from '@project-r/styleguide'
import ErrorMessage from '../../ErrorMessage'

import {
  User
} from '../../../types/admin'
import { validate as isEmail } from 'email-validator'
import routes from '../../../routes'
const { Link } = routes

export interface UserResult {
  user: User
}

export interface UserParams {
  userId?: string
}

interface Props {
  [prop: string]: any
}

interface State {
  errors?: any,
  sourceEmail?: string
  targetEmail?: string
  sourceUser?: User
  targetUser?: User
  mergedUser?: User
}

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
  users(limit: 1, search: $email) {
    items {
      id
      email
      name
    }
  }
}
`

const mergeUsersMutation = gql`
mutation mergeUsers($sourceId: ID!, $targetId: ID!) {
  mergeUsers(sourceUserId: $sourceId, targetUserId: $targetId) {
    id
    email
  }
}
`


const CheckIcon = () =>
  <span>
    <svg fill={colors.primary} height="24" viewBox="0 0 24 24" width="24" >
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>
  </span>


export default class MergeUsers extends React.Component<Props, State> {

  public static contextTypes = {
    client: PropTypes.object
  }

  constructor(props: Props) {
    super(props)
    this.state = { errors: null }
  }

  public handleUserResponse = (userType: string) => (response: any) => {
    if (response.data.users.items.length === 1) {
      this.setState(() => ({
        [`${userType}User`]: response.data.users.items[0]
      }))
    }
  }

  public findUser = (userType: string) => (e: any, value: string) => {
    this.setState(() => ({
      [`${userType}Email`]: value
    }))

    if (isEmail(value)) {
      const { client } = this.context
      if (client) {
        client
        .query({
          query: findUserQuery,
          variables: { email: value }
        })
        .then(this.handleUserResponse(userType))
        .catch((error: any) => this.setState({
          errors: error
        }))
      }
    }

  }

  public handleMergeResponse = (response: any) => {
    this.setState(() => ({
      sourceUser: null,
      targetUser: null,
      mergedUser: response.data.mergeUsers
    }))
  }

  public mergeUsers = () => {
    const { client } = this.context
    const { sourceUser, targetUser } = this.state
    if (sourceUser && targetUser) {
      if (confirm(`Willst du wirklich den Account ${sourceUser.email}
         mit dem Account ${targetUser.email} zusammenführen?`)) {
        client
        .mutate({
          mutation: mergeUsersMutation,
          variables: { sourceId: sourceUser.id, targetId: targetUser.id }
        })
        .then(this.handleMergeResponse)
        .catch((error: any) => this.setState({
          errors: error
        }))
      }
    }
  }

  public componentWillReceiveProps() {
    this.state = { errors: {} }
  }

  public render() {
    const {
      errors,
      sourceUser,
      targetUser,
      sourceEmail,
      targetEmail,
      mergedUser
    } = this.state


    return <div>
      <Interaction.H3>Users zusammenführen</Interaction.H3>
      { errors && <ErrorMessage error={errors} />}
      <div style={{
        display: 'flex', justifyContent: 'space-between', height: '120px'
      }}>
        <div style={{flex: '50%'}}>
          <div style={{display: 'inline-block', width: '90%'}}>
            <Field
              label="Email Quelle"
              value={sourceEmail}
              onChange={this.findUser('source')}
            />
          </div>
          { sourceUser && <CheckIcon /> }<br />
          { sourceUser && <Label>{sourceUser.name}, {sourceUser.email}</Label>}
        </div>
        <div style={{flex: '50%'}}>
          <div style={{display: 'inline-block', width: '90%'}}>
            <Field
              label="Email Ziel"
              value={targetEmail}
              onChange={this.findUser('target')}
            />
          </div>
          { targetUser && <CheckIcon /> }<br />
          { targetUser && <Label>{targetUser.name}, {targetUser.email}</Label> }
        </div>
      </div>
      <Button
        primary
        disabled={!sourceUser || !targetUser}
        onClick={this.mergeUsers}
      >
        Zusammenführen
      </Button>
      { mergedUser && (
        <div style={{marginTop: '30px'}}>
          Prima! Die Accounts wurden zusammen geführt. <br />
          <Link route="user" params={{ userId: mergedUser.id }}>
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
  }
}
