import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import { H1, Field } from '@project-r/styleguide'
import { Row, Column } from './Grid'
import { User, UserParams } from '../types/users'

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
    <Column>
      <H1>
        {props.data.user.name}
      </H1>
      <Field
        value={props.data.user.firstName}
        label="First name"
      />
      <Field value={props.data.user.email} label="E-mail" />
      <Field
        value={props.data.user.lastName}
        label="Last name"
      />
      <Field
        value={props.data.user.birthDate}
        label="Birth date"
      />
    </Column>
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
      createdAt
      updatedAt
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
