import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
export const ME_QUERY = gql`
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
  graphql(ME_QUERY, {
    props: ({ data }) => {
      return {
        me: data.me,
      }
    },
  })(Component)

export default withMe
