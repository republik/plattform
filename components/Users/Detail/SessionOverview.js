import React, { Component } from 'react'
import { css } from 'glamor'
import { compose } from 'redux'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {
  Label,
  Button,
  Interaction,
  colors
} from '@project-r/styleguide'
import List, { Item } from '../../List'

const sessionQuery = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      sessions {
        id
        expiresAt
        city
        country
        countryFlag
        ipAddress
        userAgent
      }
    }
  }
`

const clearSessionMutation = gql`
  mutation clearSession(
    $sessionId: ID!
    $userId: ID!
  ) {
    clearSession(
      sessionId: $sessionId
      userId: $userId
    )
  }
`

const clearSessionsMutation = gql`
  mutation clearSessions($userId: ID!) {
    clearSessions(userId: $userId)
  }
`

const styles = {
  session: css({
    padding: 10,
    backgroundColor: colors.secondaryBg
  })
}

class SessionOverview extends Component {
  render() {
    const sessions =
      (this.props.data &&
        this.props.data.user &&
        this.props.data.user.sessions) ||
      []
    return (
      <List>
        {sessions.map((session, index) => (
          <Item key={`session-${index}`}>
            <div {...styles.session}>
              <Label>
                {session.id} {session.expiresAt}
              </Label>
              <Interaction.P>
                {session.city} {session.country}
              </Interaction.P>
              <Interaction.P>
                {session.ipAddress} /{' '}
                {session.userAgent}
              </Interaction.P>
              <Button
                onClick={() => {
                  this.props.clearSession({
                    userId: this.props.user.id,
                    sessionId: session.id
                  })
                }}
              >
                Clear Session
              </Button>
            </div>
          </Item>
        ))}
        <Button
          disabled={sessions.length === 0}
          onClick={() => {
            this.props.clearSessions({
              userId: this.props.user.id
            })
          }}
        >
          Clear all Sessions
        </Button>
      </List>
    )
  }
}

const WrappedSessionOverview = compose(
  graphql(clearSessionMutation, {
    props: ({ mutate, ownProps: { user } }) => ({
      clearSession: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: sessionQuery,
                variables: {
                  id: user.id
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(clearSessionsMutation, {
    props: ({ mutate, ownProps: { user } }) => ({
      clearSessions: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: sessionQuery,
                variables: {
                  id: user.id
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(sessionQuery, {
    options: ({ user }) => {
      return {
        variables: {
          id: user.id
        }
      }
    }
  })
)(SessionOverview)

export default WrappedSessionOverview
