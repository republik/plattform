import { useEffect, useState } from 'react'
import fetch from 'isomorphic-unfetch'
import { reportError } from '../../lib/errors'
import { useMe } from '../context/MeContext'

const useProlitterisTracking = (documentId: string, cleanedPath: string) => {
  // if we try to pass me/prolitterisConsent into the hook we run into
  // 'me is not defined'-type of issues. :-/
  const { me, meLoading, hasAccess } = useMe()
  const [onceAndDone, setOnceAndDone] = useState(false)
  useEffect(() => {
    if (onceAndDone) return
    if (meLoading) return
    if (me && !me.prolitterisConsent) return
    async function fetchProlitteris() {
      fetch(
        `/api/prolitteris?paid=${
          hasAccess ? 'pw' : 'na'
        }&uid=${documentId}&path=${cleanedPath}`,
      ).catch((error) => reportError('prolitterisApiError', error))
    }
    fetchProlitteris()
    setOnceAndDone(true)
  }, [me, meLoading, hasAccess, onceAndDone])
}

export default useProlitterisTracking
