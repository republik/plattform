import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'

const GET_REPO_FILE = gql`
  query getRepoFile($id: ID!) {
    repoFile(id: $id) {
      id
      url
      status
    }
  }
`

/**
 * Hook to resolve repo-file:// URLs to actual HTTP URLs for preview
 * @param url - The URL, which might be a repo-file:// URL or regular HTTP URL
 * @returns The resolved HTTP URL or the original URL
 */
export function useRepoFileUrl(url: string | undefined): string | undefined {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(url)

  // Extract file ID from repo-file:// URLs
  const fileId =
    url && url.startsWith('repo-file://') ? url.replace('repo-file://', '') : null

  const { data } = useQuery(GET_REPO_FILE, {
    variables: { id: fileId },
    skip: !fileId,
  })

  useEffect(() => {
    if (fileId && data?.repoFile?.url) {
      setResolvedUrl(data.repoFile.url)
    } else if (!fileId) {
      setResolvedUrl(url)
    }
  }, [fileId, data, url])

  return resolvedUrl
}

