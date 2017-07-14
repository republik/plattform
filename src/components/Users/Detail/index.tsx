import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import { Interaction, Label } from '@project-r/styleguide'
import Input from '../../Form/Input'
import {
  Container,
  Tile,
  ContainerTile
} from '../../Layout/Grid'
import { User, Pledge } from '../../../types/admin'
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
      <div>
        <Input
          name="email"
          label="Email"
          type="email"
          value={props.data.user.email}
        />
      </div>
      <div>
        <Interaction.H3>General</Interaction.H3>
        <Input
          name="firstName"
          type="text"
          label="First name"
          value={props.data.user.firstName}
        />
        <Input
          name="lastName"
          type="text"
          label="Last name"
          value={props.data.user.lastName}
        />
        <Input
          name="birthDate"
          type="date"
          label="Birth date"
          value={props.data.user.birthDate}
        />
        <Interaction.H3>Address</Interaction.H3>
        <Input
          name="name"
          type="text"
          label="Name"
          value={
            props.data.user.address
              ? props.data.user.address.name
              : ''
          }
        />
        <Input
          name="line1"
          type="text"
          label="Line 1"
          value={
            props.data.user.address
              ? props.data.user.address.line1
              : ''
          }
        />
        <Input
          name="line2"
          type="text"
          label="Line 2"
          value={
            props.data.user.address
              ? props.data.user.address.line2
              : ''
          }
        />
        <Input
          name="postalCode"
          label="Postal code"
          type="text"
          value={
            props.data.user.address
              ? props.data.user.address.postalCode
              : ''
          }
        />
        <Input
          name="city"
          label="City"
          type="text"
          value={
            props.data.user.address
              ? props.data.user.address.city
              : ''
          }
        />
        <Input
          name="country"
          label="Country"
          type="text"
          value={
            props.data.user.address
              ? props.data.user.address.country
              : ''
          }
        />
      </div>
      <div>
        <Interaction.H3>Pledges</Interaction.H3>
        <div>
          {props.data.user.pledges.map(
            (pledge: Pledge, index: number) =>
              <PledgeOverview
                pledge={pledge}
                key={`pledge-${pledge.id}`}
              />
          )}
        </div>
      </div>
    </div>
  )
}

const user = gql`
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
      pledges {
        id
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
        }
      }
    }
  }
`

export default graphql(user, {
  options: ({ params: { userId } }: OwnProps) => {
    return {
      variables: {
        id: userId
      }
    }
  }
})(User)
