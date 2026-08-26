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

const Unpublish = ({ file, isInUse }) => {
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

  // Disable the button if the file is being used in the document
  const disabled = loading || isInUse

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      small
      style={{ whiteSpace: 'nowrap' }}
      title={
        isInUse
          ? 'Diese Datei wird im Dokument verwendet und kann nicht zurückgezogen werden. Entfernen Sie zuerst alle Links zur Datei aus dem Dokument.'
          : undefined
      }
    >
      Nicht mehr veröffentlichen
    </Button>
  )
}

export default Unpublish
