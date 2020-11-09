import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
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

const withMe = Component =>
  graphql(meQuery, {
    props: ({ data }) => {
      return {
        me: data.me
      }
    }
  })(Component)

export default withMe
