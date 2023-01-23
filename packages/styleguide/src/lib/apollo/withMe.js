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
      portrait
    }
  }
`

const withMe = (Component) =>
  graphql(meQuery, {
    props: ({ data }) => {
      return {
        me: data.me,
      }
    },
  })(Component)

export default withMe
