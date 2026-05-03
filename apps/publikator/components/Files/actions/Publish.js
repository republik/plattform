import { gql, useMutation } from '@apollo/client'
import { Button } from '@project-r/styleguide'

import { RepoFile } from '../../../lib/graphql/fragments'

const MAKE_PUBLIC = gql`
  mutation repoFileMakePublic($id: ID!) {
    repoFileMakePublic(id: $id) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const Publish = ({ file }) => {
  const [makePublic, { loading }] = useMutation(MAKE_PUBLIC)

  const onClick = () => {
    makePublic({ variables: { id: file.id } })
  }

  return (
    <Button onClick={onClick} disabled={loading} primary small style={{ whiteSpace: 'nowrap' }}>
      veröffentlichen
    </Button>
  )
}

export default Publish
