import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

export const meQuery = gql`
  query me {
    me {
      id
      name
      firstName
      lastName
      email
      roles
    }
  }
`

export default (Component) =>
  graphql(meQuery, {
    props: ({ data }) => {
      return {
        me: data.me,
      }
    },
  })(Component)
