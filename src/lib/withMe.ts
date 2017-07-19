import { gql, graphql } from 'react-apollo'

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

export default (Component: any) =>
  graphql(meQuery, {
    props: ({ data }: any) => {
      return {
        me: data.me
      }
    }
  })(Component)
