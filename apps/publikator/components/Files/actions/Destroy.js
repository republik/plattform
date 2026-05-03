import { gql, useMutation } from '@apollo/client'
import { Button } from '@project-r/styleguide'

import { RepoFile } from '../../../lib/graphql/fragments'

const DESTROY = gql`
  mutation repoFileDestroy($id: ID!) {
    repoFileDestroy(id: $id) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const Destroy = ({ file }) => {
  const [destroy, { loading }] = useMutation(DESTROY)

  const onClick = () => {
    destroy({
      variables: { id: file.id },
      awaitRefetchQueries: true,
      refetchQueries: ['getFiles'],
    })
  }

  return (
    <Button onClick={onClick} disabled={loading} small style={{ whiteSpace: 'nowrap' }}>
      entfernen
    </Button>
  )
}

export default Destroy
