import { gql, useMutation } from '@apollo/client'
import { Button } from '@project-r/styleguide'

import { RepoFile } from '../../lib/graphql/fragments'

const UPDATE_ASSET = gql`
  mutation updateRepoFile($id: ID!, $public: Boolean!) {
    updateRepoFile(id: $id, public: $public) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

export default ({ file }) => {
  const [update, { loading }] = useMutation(UPDATE_ASSET)

  const onClick = () => {
    update({
      variables: { id: file.id, public: true },
      refetchQueries: ['getFiles'],
      awaitRefetchQueries: true,
    })
  }

  if (file.status === 'PRIVATE') {
    return (
      <Button onClick={onClick} disabled={loading} primary small>
        Publizieren
      </Button>
    )
  }

  return null
}
