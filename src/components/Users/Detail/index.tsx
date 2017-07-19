import * as React from 'react'
import { compose } from 'redux'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import { Interaction, Label } from '@project-r/styleguide'
import { User, Pledge } from '../../../types/admin'
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

const User = (props: Props) => {
  if (props.data.loading) {
    return <div>Loading ...</div>
  }
  return (
    <div>
      <div>
        <img
          style={{ maxWidth: '180px' }}
          src={
            props.data.user.testimonial
              ? props.data.user.testimonial.image
              : ''
          }
        />
        <Interaction.H3>
          {props.data.user.name}
        </Interaction.H3>
      </div>
      <UserForm
        user={props.data.user}
        onSubmit={props.updateUser}
      />
      <EmailForm
        user={props.data.user}
        onSubmit={props.updateEmail}
      />
      <div>
        {props.data.user.pledges.map(
          (pledge: Pledge, index: number) =>
            <PledgeOverview
              pledge={pledge}
              onResolvePledge={props.resolvePledgeToPayment}
              onCancelPledge={props.cancelPledge}
              onUpdatePaymentStatus={props.updatePayment}
              key={`pledge-${pledge.id}`}
            />
        )}
      </div>
    </div>
  )
}

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
)(User)

export default WrappedUser as React.ComponentClass<OwnProps>
