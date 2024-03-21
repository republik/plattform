import { gql, useMutation } from '@apollo/client'
import { Button } from '@project-r/styleguide'

import { RepoFile } from '../../../lib/graphql/fragments'

const MAKE_PRIVATE = gql`
  mutation repoFileMakePrivate($id: ID!) {
    repoFileMakePrivate(id: $id) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const Publish = ({ file }) => {
  const [makePrivate, { loading }] = useMutation(MAKE_PRIVATE)

  const onClick = () => {
    if (
      window.confirm(
        'Achtung! Links auf diese Datei werden nicht mehr funktionieren.',
      )
    ) {
      makePrivate({ variables: { id: file.id } })
    }
  }

  return (
    <Button onClick={onClick} disabled={loading} small>
      Nicht mehr veröffentlichen
    </Button>
  )
}

export default Publish
