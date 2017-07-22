import * as React from 'react'
import { compose } from 'redux'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import {
  Interaction,
  P,
  Label,
  colors
} from '@project-r/styleguide'
import ErrorMessage from '../../ErrorMessage'

import {
  User,
  Pledge,
  Membership
} from '../../../types/admin'
import { css } from 'glamor'
import UserForm from './UserForm'
import EmailForm from './EmailForm'
import PledgeOverview from './PledgeOverview'
import MembershipOverview from './MembershipOverview'

export interface UserResult {
  user: User
}

export interface UserParams {
  userId: string
}

interface OwnProps {
  [prop: string]: any
  params: UserParams
}

interface Props extends OwnProps {
  data: QueryProps & { user: User }
}

interface State {
  errors: {
    [key: string]: string
  }
}

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
  })
}

class Detail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { errors: {} }
  }

  public updateUser = (user: User) => {
    this.props.updateUser(user).catch((e: any) => {
      this.setState(() => ({
        errors: {
          ...this.state.errors,
          user: e
        }
      }))
    })
  }

  public updateEmail = (user: User) => {
    this.props.updateEmail(user).catch((e: any) => {
      this.setState(() => ({
        errors: {
          ...this.state.errors,
          email: e
        }
      }))
    })
  }

  public sendPaymentReminders = (paymentId: string) => {
    this.props
      .sendPaymentReminders({ paymentIds: [paymentId] })
      .catch((e: any) => {
        this.setState(() => ({
          errors: {
            ...this.state.errors,
            email: e
          }
        }))
      })
  }

  public willReceiveProps() {
    this.state = { errors: {} }
  }

  public render() {
    const props = this.props
    if (props.data.error) {
      return <ErrorMessage error={props.data.error} />
    } else if (props.data.loading) {
      return <div>Loading ...</div>
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
        </Label>
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
            {!!props.data.user.testimonial &&
              <div>
                <Interaction.H3>Statement</Interaction.H3>
                <br />
                <img
                  style={{
                    width: '100%',
                    maxWidth: '200px'
                  }}
                  src={props.data.user.testimonial.image}
                />
                <br />
                <Label>
                  {props.data.user.testimonial.role}
                </Label>
                <P>
                  «{props.data.user.testimonial.quote}»
                </P>
              </div>}
          </div>
        </div>
        <br />
        <br />
        <Interaction.H2>Pledges</Interaction.H2>
        <div {...styles.pledges}>
          {props.data.user.pledges
            .filter(p => p.status !== 'DRAFT')
            .map((pledge: Pledge, index: number) =>
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
            )}
        </div>
        <Interaction.H2>Memberships</Interaction.H2>
        <div {...styles.pledges}>
          {props.data.user.memberships.map(
            (membership: Membership, index: number) =>
              <div
                {...styles.pledge}
                key={`pledge-${membership.id}`}
              >
                <MembershipOverview
                  membership={membership}
                />
              </div>
          )}
        </div>
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
  query user($id: ID!) {
    user(id: $id) {
      id
      name
      email
      firstName
      lastName
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
      testimonial {
        role
        quote
        image
      }
      roles
      memberships {
        id
        type {
          name
        }
        sequenceNumber
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
      updateEmail: ({ id, email }: User) => {
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
      updateUser: (variables: User) => {
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
    }: any) => ({
      sendPaymentReminders: ({ paymentIds }: any) => {
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
    }: any) => ({
      resolvePledgeToPayment: (variables: any) => {
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
    }: any) => ({
      updatePayment: (variables: any) => {
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
    }: any) => ({
      cancelPledge: (variables: any) => {
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
    options: ({ params: { userId } }: OwnProps) => {
      return {
        variables: {
          id: userId
        }
      }
    }
  })
)(Detail)

export default WrappedUser as React.ComponentClass<OwnProps>
