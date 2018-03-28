import React, { Component } from 'react'
import { compose } from 'redux'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {
  Interaction,
  P,
  Label,
  colors
} from '@project-r/styleguide'
import ErrorMessage from '../../ErrorMessage'

import { css } from 'glamor'
import UserForm from './UserForm'
import EmailForm from './EmailForm'
import PledgeOverview from './PledgeOverview'
import MembershipOverview from './MembershipOverview'
import EventLog from './EventLog'

const GUTTER = 60
const styles = {
  grid: css({
    boxSizing: 'border-box',
    clear: 'both',
    width: `calc(100% + ${GUTTER}px)`,
    margin: `0 -${GUTTER / 2}px`,
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  span: css({
    boxSizing: 'border-box',
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`,
    minHeight: 1,
    width: '50%'
  }),
  pledges: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap'
  }),
  pledge: css({
    width: `calc(50% - ${GUTTER}px)`,
    padding: 10,
    backgroundColor: colors.secondaryBg,
    marginBottom: GUTTER
  }),
  tabNav: css({
    padding: '30px 0'
  }),
  tabLink: css({
    cursor: 'pointer',
    padding: '15px 0',
    '&.active': {
      textDecoration: 'underline'
    },
    '&:not(:first-child)': {
      marginLeft: '10px'
    }
  })
}

const Tab = ({ name, current, children, ...props }) =>
  name === current && <div {...props}>{children}</div>

const TabLink = ({ name, current, children, ...props }) => (
  <a
    {...props}
    {...styles.tabLink}
    className={current === name ? 'active' : null}
  >
    {children}
  </a>
)

class Detail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {},
      selectedTab: 'details'
    }
  }

  updateUser = user => {
    this.props.updateUser(user).catch(e => {
      this.setState(() => ({
        errors: {
          ...this.state.errors,
          user: e
        }
      }))
    })
  }

  updateEmail = user => {
    this.props.updateEmail(user).catch(e => {
      this.setState(() => ({
        errors: {
          ...this.state.errors,
          email: e
        }
      }))
    })
  }

  sendPaymentReminders = (paymentId: string) => {
    this.props
      .sendPaymentReminders({
        paymentIds: [paymentId]
      })
      .catch(e => {
        this.setState(() => ({
          errors: {
            ...this.state.errors,
            email: e
          }
        }))
      })
  }

  tabLinkHandler = name => () => {
    this.setState(() => ({
      selectedTab: name
    }))
  }

  willReceiveProps() {
    this.state = {
      errors: {},
      selectedTab: this.state.selectedTab
    }
  }

  render() {
    const props = this.props
    if (props.data.error) {
      return <ErrorMessage error={props.data.error} />
    } else if (props.data.loading) {
      return <div>Loading ...</div>
    }
    return (
      <div style={{ overflow: 'hidden' }}>
        <Interaction.H1>
          {props.data.user.name}
        </Interaction.H1>
        <Label>
          {props.data.user.email}
          {props.data.user.username &&
            ` | ${props.data.user.username}`}
        </Label>
        <div {...styles.tabNav}>
          <TabLink
            name="details"
            onClick={this.tabLinkHandler('details')}
            current={this.state.selectedTab}
          >
            Personalien
          </TabLink>
          <TabLink
            name="memberships"
            current={this.state.selectedTab}
            onClick={this.tabLinkHandler('memberships')}
          >
            Pledges {'&'} Memberships
          </TabLink>
          <TabLink
            name="eventLog"
            onClick={this.tabLinkHandler('eventLog')}
            current={this.state.selectedTab}
          >
            Event Log
          </TabLink>
        </div>
        <Tab
          name="details"
          current={this.state.selectedTab}
        >
          <div {...styles.grid}>
            <div {...styles.span}>
              <UserForm
                user={props.data.user}
                onSubmit={this.updateUser}
              />
            </div>
            <div {...styles.span}>
              <EmailForm
                error={this.state.errors.email}
                user={props.data.user}
                onSubmit={this.updateEmail}
              />
              <br />
              <br />
              {!!props.data.user.portrait && (
                <div>
                  <Interaction.H3>Portrait</Interaction.H3>
                  <br />
                  <img
                    style={{
                      width: '100%',
                      maxWidth: '200px'
                    }}
                    src={props.data.user.portrait}
                  />
                </div>
              )}
              {!!props.data.user.statement && (
                <div>
                  <Interaction.H3>Statement</Interaction.H3>
                  <br />
                  <P>«{props.data.user.statement}»</P>
                </div>
              )}
            </div>
          </div>
        </Tab>
        <Tab
          name="memberships"
          current={this.state.selectedTab}
        >
          <Interaction.H2>Pledges</Interaction.H2>
          <div {...styles.pledges}>
            {props.data.user.pledges
              .filter(p => p.status !== 'DRAFT')
              .map(pledge => (
                <div
                  {...styles.pledge}
                  key={`pledge-${pledge.id}`}
                >
                  <PledgeOverview
                    pledge={pledge}
                    onResolvePledge={
                      props.resolvePledgeToPayment
                    }
                    onCancelPledge={props.cancelPledge}
                    onUpdatePaymentStatus={
                      props.updatePayment
                    }
                    onRemindPayment={
                      this.sendPaymentReminders
                    }
                  />
                </div>
              ))}
          </div>
          <Interaction.H2>Memberships</Interaction.H2>
          <div {...styles.pledges}>
            {props.data.user.memberships.map(membership => (
              <div
                {...styles.pledge}
                key={`pledge-${membership.id}`}
              >
                <MembershipOverview
                  membership={membership}
                />
              </div>
            ))}
          </div>
        </Tab>
        <Tab
          name="eventLog"
          current={this.state.selectedTab}
        >
          <EventLog items={this.props.data.user.eventLog} />
        </Tab>
      </div>
    )
  }
}

const sendPaymentRemindersMutation = gql`
  mutation sendPaymentReminders($paymentIds: [ID!]!) {
    sendPaymentReminders(paymentIds: $paymentIds)
  }
`

const resolvePledgeToPaymentMutation = gql`
  mutation resolvePledgeToPayment(
    $pledgeId: ID!
    $reason: String!
  ) {
    resolvePledgeToPayment(
      pledgeId: $pledgeId
      reason: $reason
    ) {
      id
    }
  }
`

const cancelPledgeMutation = gql`
  mutation cancelPledge($pledgeId: ID!) {
    cancelPledge(pledgeId: $pledgeId) {
      id
    }
  }
`

const updatePaymentMutation = gql`
  mutation updatePayment(
    $paymentId: ID!
    $status: PaymentStatus!
    $reason: String
  ) {
    updatePayment(
      paymentId: $paymentId
      status: $status
      reason: $reason
    ) {
      id
    }
  }
`

const userMutation = gql`
  mutation updateUser(
    $id: ID!
    $birthday: Date
    $firstName: String!
    $lastName: String!
    $phoneNumber: String
    $address: AddressInput!
  ) {
    updateUser(
      userId: $id
      birthday: $birthday
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      address: $address
    ) {
      id
    }
  }
`

const emailMutation = gql`
  mutation updateEmail($id: ID!, $email: String!) {
    updateEmail(userId: $id, email: $email) {
      id
    }
  }
`

const userQuery = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      name
      email
      firstName
      lastName
      username
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
      createdAt
      updatedAt
      statement
      portrait(size: SMALL)
      roles
      eventLog {
        type
        createdAt
        archivedSession {
          email
          userAgent
          isCurrent
        }
        activeSession {
          isCurrent
        }
      }
      memberships {
        id
        type {
          name
        }
        sequenceNumber
        periods {
          beginDate
          endDate
          createdAt
          updatedAt
        }
        cancelReasons
        active
        renew
        createdAt
        updatedAt
      }
      pledges {
        id
        total
        status
        createdAt
        updatedAt
        reason
        donation
        memberships {
          id
          voucherCode
          reducedPrice
          claimerName
          sequenceNumber
          createdAt
          updatedAt
        }
        package {
          name
        }
        options {
          id
          reward {
            ... on Goodie {
              name
            }
            ... on MembershipType {
              name
            }
          }
          price
        }
        payments {
          id
          method
          status
          total
          dueDate
          hrid
          pspId
          remindersSentAt
          createdAt
          updatedAt
        }
      }
    }
  }
`

const WrappedUser = compose(
  graphql(emailMutation, {
    props: ({ mutate }) => ({
      updateEmail: ({ id, email }) => {
        if (mutate) {
          return mutate({
            variables: { id, email },
            refetchQueries: [
              {
                query: userQuery,
                variables: {
                  id
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(userMutation, {
    props: ({ mutate }) => ({
      updateUser: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: userQuery,
                variables: {
                  id: variables.id
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(sendPaymentRemindersMutation, {
    props: ({
      mutate,
      ownProps: { params: { userId } }
    }) => ({
      sendPaymentReminders: ({ paymentIds }) => {
        if (mutate) {
          return mutate({
            variables: { paymentIds },
            refetchQueries: [
              {
                query: userQuery,
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
  graphql(resolvePledgeToPaymentMutation, {
    props: ({
      mutate,
      ownProps: { params: { userId } }
    }) => ({
      resolvePledgeToPayment: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: userQuery,
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
  graphql(updatePaymentMutation, {
    props: ({
      mutate,
      ownProps: { params: { userId } }
    }) => ({
      updatePayment: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: userQuery,
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
  graphql(cancelPledgeMutation, {
    props: ({
      mutate,
      ownProps: { params: { userId } }
    }) => ({
      cancelPledge: variables => {
        if (mutate) {
          return mutate({
            variables,
            refetchQueries: [
              {
                query: userQuery,
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
  graphql(userQuery, {
    options: ({ params: { userId } }) => {
      return {
        variables: {
          id: userId
        }
      }
    }
  })
)(Detail)

export default WrappedUser
