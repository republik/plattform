import React, { Component } from 'react'
import { css } from 'glamor'
import { compose } from 'react-apollo'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {
  Label,
  Interaction,
  colors
} from '@project-r/styleguide'
import List, { Item } from '../List'

import {
  displayDateTime,
  Section,
  SectionTitle,
  TextButton
} from '../Display/utils'

const sessionQuery = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      sessions {
        id
        expiresAt
        city
        country
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
      <Section>
        <SectionTitle>Aktive Sessions</SectionTitle>
        <List>
          {sessions.map((session, index) => (
            <Item key={`session-${index}`}>
              <div {...styles.session}>
                <Label>
                  Gültig bis {displayDateTime(session.expiresAt)}
                </Label>
                <Interaction.P>
                  {session.city} {session.country}
                </Interaction.P>
                <Interaction.P>
                  {session.userAgent}
                </Interaction.P>
                <TextButton
                  onClick={() => {
                    this.props.clearSession({
                      userId: this.props.data.user.id,
                      sessionId: session.id
                    })
                  }}
                >
                  clear session
                </TextButton>
              </div>
            </Item>
          ))}
          <TextButton
            disabled={sessions.length === 0}
            onClick={() => {
              this.props.clearSessions({
                userId: this.props.data.user.id
              })
            }}
          >
            clear all sessions
          </TextButton>
        </List>
      </Section>
    )
  }
}

const WrappedSessionOverview = compose(
  graphql(clearSessionMutation, {
    props: ({ mutate, ownProps: { userId } }) => ({
      clearSession: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: sessionQuery,
                variables: {
                  id: userId
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(clearSessionsMutation, {
    props: ({ mutate, ownProps: { userId } }) => ({
      clearSessions: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: sessionQuery,
                variables: {
                  id: userId
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(sessionQuery, {
    options: ({ userId }) => {
      return {
        variables: {
          id: userId
        }
      }
    }
  })
)(SessionOverview)

export default WrappedSessionOverview
