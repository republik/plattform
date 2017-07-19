import * as React from 'react'
import { compose } from 'redux'
import { gql, graphql, OptionProps, QueryProps } from 'react-apollo'
import { Interaction, Label, colors } from '@project-r/styleguide'
import { User, Pledge } from '../../../types/admin'
import { css } from 'glamor'
import UserForm from './UserForm'
import EmailForm from './EmailForm'
import PledgeOverview from './PledgeOverview'

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

const GUTTER = 60
const styles = {
  formContainer: css({
    float: 'left',
    boxSizing: 'border-box',
    width: `calc(100% - ${180 + GUTTER}px)`
  }),
  clear: css({
    clear: 'both'
  }),
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

const User = (props: Props) => {
  if (props.data.loading) {
    return <div>Loading ...</div>
  }
  return (
    <div>
      {!!props.data.user.testimonial &&
        <img
          style={{ maxWidth: '180px', float: 'right' }}
          src={props.data.user.testimonial.image}
        />}
      <Interaction.H1>
        {props.data.user.name}
      </Interaction.H1>
      <Label>
        {props.data.user.email}
      </Label>
      <div {...styles.formContainer}>
        <div {...styles.grid}>
          <div {...styles.span}>
            <UserForm user={props.data.user} onSubmit={props.updateUser} />
          </div>
          <div {...styles.span}>
            <EmailForm user={props.data.user} onSubmit={props.updateEmail} />
          </div>
        </div>
      </div>
      <br {...styles.clear} />
      <br />
      <br />
      <Interaction.H2>Pledges</Interaction.H2>
      <div {...styles.pledges}>
        {props.data.user.pledges.map((pledge: Pledge, index: number) =>
          <div {...styles.pledge} key={`pledge-${pledge.id}`}>
            <PledgeOverview
              pledge={pledge}
              onResolvePledge={props.resolvePledgeToPayment}
              onCancelPledge={props.cancelPledge}
              onUpdatePaymentStatus={props.updatePayment}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const resolvePledgeToPaymentMutation = gql`
  mutation resolvePledgeToPayment($pledgeId: ID!, $reason: String!) {
    resolvePledgeToPayment(pledgeId: $pledgeId, reason: $reason) {
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
    updatePayment(paymentId: $paymentId, status: $status, reason: $reason) {
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
        image
      }
      roles
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
        }
        payments {
          id
          method
          status
          total
          dueDate
          hrid
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
  graphql(resolvePledgeToPaymentMutation, {
    props: ({ mutate, ownProps: { params: { userId } } }: any) => ({
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
    props: ({ mutate, ownProps: { params: { userId } } }: any) => ({
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
    props: ({ mutate, ownProps: { params: { userId } } }: any) => ({
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
)(User)

export default WrappedUser as React.ComponentClass<OwnProps>
