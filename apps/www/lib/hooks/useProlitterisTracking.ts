import { useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import { reportError } from '../../lib/errors'

const useProlitterisTracking = (
  hasAccess: boolean,
  documentId: string,
  cleanedPath: string,
) => {
  useEffect(() => {
    async function fetchProlitteris() {
      fetch(
        `/api/prolitteris?paid=${
          hasAccess ? 'pw' : 'na'
        }&uid=${documentId}&path=${cleanedPath}`,
      ).catch((error) => reportError('prolitterisApiError', error))
    }
    fetchProlitteris()
  }, [])
}

export default useProlitterisTracking
