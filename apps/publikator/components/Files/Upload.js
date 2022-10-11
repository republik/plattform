import { useMemo, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Dropzone from 'react-dropzone'
import axios from 'axios'
import { css } from 'glamor'

import { ProgressCircle, useColorContext } from '@project-r/styleguide'

import { RepoFile } from '../../lib/graphql/fragments'

const UPLOAD_BEGIN = gql`
  mutation repoFileUploadBegin($repoId: ID!, $name: String!) {
    repoFileUploadBegin(repoId: $repoId, name: $name) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const UPLOAD_COMMIT = gql`
  mutation repoFileUploadCommit($id: ID!) {
    repoFileUploadCommit(id: $id) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const UPLOAD_ABORT = gql`
  mutation repoFileUploadAbort($id: ID!, $error: String!) {
    repoFileUploadAbort(id: $id, error: $error) {
      ...RepoFile
    }
  }

  ${RepoFile}
`

const Upload = ({ repoId }) => {
  const [colorScheme] = useColorContext()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(100)

  const [uploadBegin] = useMutation(UPLOAD_BEGIN)
  const [uploadCommit] = useMutation(UPLOAD_COMMIT)
  const [uploadAbort] = useMutation(UPLOAD_ABORT)

  const styles = useMemo(
    () => ({
      dropzone: css({
        height: '11rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '3px dashed',
        margin: '1rem 0 2rem',
        borderColor: colorScheme.getCSSColor('divider'),
      }),
      dropzoneActive: css({
        borderColor: colorScheme.getCSSColor('primary'),
        backgroundColor: colorScheme.getCSSColor('alert'),
      }),
    }),
    [colorScheme],
  )

  const onDrop = async (accepted) => {
    setUploading(true)
    setProgress(0)

    const dropTotal = accepted.reduce((size, file) => size + file.size, 0)
    let dropLoaded = 0

    for await (const file of accepted) {
      const { data } = await uploadBegin({
        variables: { repoId, name: file.name },
        refetchQueries: ['getFiles'],
        awaitRefetchQueries: true,
      })

      const id = data?.repoFileUploadBegin?.id

      await axios(data?.repoFileUploadBegin?.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        data: file,
        onUploadProgress: (progressEvent) => {
          const { loaded: fileLoaded, total: fileTotal } = progressEvent

          if (fileTotal) {
            setProgress(
              Math.round(((dropLoaded + fileLoaded) / dropTotal) * 100),
            )

            if (fileLoaded === fileTotal) {
              dropLoaded += fileLoaded
            }
          }
        },
      })
        .then(() => uploadCommit({ variables: { id } }))
        .catch((e) => uploadAbort({ variables: { id, error: e.message } }))
    }

    setUploading(false)
  }

  return (
    <Dropzone
      disablePreview
      disabled={uploading}
      className={styles.dropzone.toString()}
      activeClassName={styles.dropzoneActive.toString()}
      onDrop={onDrop}
    >
      {({ isDragActive }) => {
        const circleProgress = isDragActive ? 100 : progress
        const circleColor =
          (isDragActive && 'primaryHover') || (progress === 100 && 'primary')

        return (
          <>
            <div>Dateien auswählen oder hier fallen lassen:</div>
            <div>
              <ProgressCircle
                progress={circleProgress}
                size={96}
                strokeColorName={circleColor}
                strokePlaceholder
                strokeWidth={6}
              />
            </div>
          </>
        )
      }}
    </Dropzone>
  )
}

export default Upload
