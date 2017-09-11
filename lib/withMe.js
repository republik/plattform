import {gql, graphql} from 'react-apollo'

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

export default (Component) => graphql(meQuery, {
  props: ({data}) => {
    return {
      me: data.me
    }
  }
})(Component)
