import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'

const query = gql`
query repositories($login: String!) {
  repositoryOwner(login: $login) {
    login
    repositories(first: 100) {
      nodes {
        name
      }
    }
  }
}
`

const List = ({
  data: { loading, error, repositoryOwner }
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }
  if (repositoryOwner && repositoryOwner.repositories) {
    return (
      <ul>
        {repositoryOwner.repositories.nodes.map(repository => (
          <li key={`${repositoryOwner.login}/${repository.name}`}>
            <Link route='github' params={{
              login: repositoryOwner.login,
              repository: repository.name
            }}>
              <a>{repository.name}</a>
            </Link>
          </li>
      ))}
      </ul>
    )
  } else {
    return (
      <div><i>empty</i></div>
    )
  }
}

export default graphql(query)(List)
