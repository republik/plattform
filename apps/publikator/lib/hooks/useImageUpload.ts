import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import axios from 'axios'

import { RepoFile } from '../graphql/fragments'

const UPLOAD_BEGIN = gql`
  mutation repoFileUploadBegin(
    $repoId: ID!
    $name: String!
    $contentType: String
    $size: Int
  ) {
    repoFileUploadBegin(
      repoId: $repoId
      name: $name
      contentType: $contentType
      size: $size
    ) {
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

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string>
  uploading: boolean
  progress: number
  error: string | null
}

export function useImageUpload(repoId: string): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [uploadBegin] = useMutation(UPLOAD_BEGIN)
  const [uploadCommit] = useMutation(UPLOAD_COMMIT)
  const [uploadAbort] = useMutation(UPLOAD_ABORT)

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // 1. Validate image type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const maxSize = 10 * 1024 * 1024 // 10 MB
      if (file.size > maxSize) {
        throw new Error('Image must be smaller than 10 MB')
      }

      // 2. Call repoFileUploadBegin
      const { data } = await uploadBegin({
        variables: {
          repoId,
          name: file.name,
          contentType: file.type,
          size: file.size,
        },
      })

      const uploadInfo = data?.repoFileUploadBegin
      if (!uploadInfo?.id || !uploadInfo?.url) {
        throw new Error('Failed to initialize upload')
      }

      const fileId = uploadInfo.id
      const uploadUrl = uploadInfo.url

      // 3. PUT file directly to S3 presigned URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size),
          )
          setProgress(percentCompleted)
        },
      })

      // 4. Call repoFileUploadCommit
      await uploadCommit({
        variables: { id: fileId },
      })

      // 5. Return repo-file://{fileId} reference
      const fileReference = `repo-file://${fileId}`
      setUploading(false)
      setProgress(100)
      return fileReference
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed'
      setError(errorMessage)
      setUploading(false)

      // Try to abort the upload if we have a file ID
      // (this might fail if we errored before getting the ID, which is fine)
      try {
        const uploadInfo = await uploadBegin({
          variables: {
            repoId,
            name: file.name,
            contentType: file.type,
            size: file.size,
          },
        })
        const fileId = uploadInfo.data?.repoFileUploadBegin?.id
        if (fileId) {
          await uploadAbort({
            variables: { id: fileId, error: errorMessage },
          })
        }
      } catch {
        // Ignore abort errors
      }

      throw err
    }
  }

  return { uploadImage, uploading, progress, error }
}

