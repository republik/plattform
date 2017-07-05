import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
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
    <div>
      Hello
      {props.data.user.email}
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
