import { Component } from 'react'
import { css } from '@republik/theme/css'
import PropTypes from 'prop-types'
import { gql } from '@apollo/client'
import { colors, Interaction, Button } from '@project-r/styleguide'
import Link from 'next/link'
import ErrorMessage from '@/components/ErrorMessage'
import SearchUser from '@/components/Form/SearchUser'

const interactiveStyles = {
  cursor: 'pointer',
}

const link = css({
  textDecoration: 'none',
  color: 'primary',
  ':visited': {
    color: 'primary',
  },
  ':hover': {
    color: 'secondary',
  },
})

const mergeUsersMutation = gql`
  mutation mergeUsers($sourceId: ID!, $targetId: ID!) {
    mergeUsers(sourceUserId: $sourceId, targetUserId: $targetId) {
      id
      email
    }
  }
`

const CheckIcon = () => (
  <span>
    <svg
      className={css({ fill: 'primary' })}
      height='24'
      viewBox='0 0 24 24'
      width='24'
    >
      <path d='M0 0h24v24H0z' fill='none' />
      <path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' />
    </svg>
  </span>
)

class MergeUsers extends Component {
  constructor(props) {
    super(props)
    this.state = { errors: null }
  }

  handleUserResponse =
    (userType) =>
    ({ value }) => {
      this.setState(() => ({
        [`${userType}User`]: value,
      }))
    }

  handleMergeResponse = (response) => {
    this.setState(() => ({
      sourceUser: null,
      targetUser: null,
      mergedUser: response.data.mergeUsers,
    }))
  }

  mergeUsers = () => {
    const { apolloClient } = this.props
    const { sourceUser, targetUser } = this.state
    if (sourceUser && targetUser) {
      if (
        confirm(`Willst du wirklich den Account ${sourceUser.email}
         mit dem Account ${targetUser.email} zusammenführen?`)
      ) {
        apolloClient
          .mutate({
            mutation: mergeUsersMutation,
            variables: {
              sourceId: sourceUser.id,
              targetId: targetUser.id,
            },
          })
          .then(this.handleMergeResponse)
          .catch((error) =>
            this.setState({
              errors: error,
            }),
          )
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.setState(() => ({
        errors: {},
      }))
    }
  }

  render() {
    const { errors, sourceUser, targetUser, mergedUser } = this.state

    return (
      <div>
        <Interaction.H3>Users zusammenführen</Interaction.H3>
        {errors && <ErrorMessage error={errors} />}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '120px',
          }}
        >
          <div style={{ flex: '50%' }}>
            <div
              style={{
                display: 'inline-block',
                width: '90%',
              }}
            >
              <SearchUser
                label='User Quelle'
                value={sourceUser}
                onChange={this.handleUserResponse('source')}
              />
            </div>
            {sourceUser && <CheckIcon />}
          </div>
          <div style={{ flex: '50%' }}>
            <div
              style={{
                display: 'inline-block',
                width: '90%',
              }}
            >
              <SearchUser
                label='User Ziel'
                value={targetUser}
                onChange={this.handleUserResponse('target')}
              />
            </div>
            {targetUser && <CheckIcon />}
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
            Prima! Die Accounts wurden zusammen geführt. <br />
            <Link
              href={`/users/${mergedUser.id}`}
              className={`${link}`}
              style={interactiveStyles}
            >
              Zum neuen User-Profil
            </Link>
          </div>
        )}
      </div>
    )
  }
}

MergeUsers.contextTypes = {
  client: PropTypes.object,
}

export default MergeUsers
