import { useEffect, useState } from 'react'
import { reportError } from '../errors/reportError'
import { useMe } from '../context/MeContext'

const useProlitterisTracking = (repoId: string, cleanedPath: string) => {
  const { me, meLoading, hasActiveMembership } = useMe()
  const [onceAndDone, setOnceAndDone] = useState(false)
  useEffect(() => {
    if (onceAndDone) return
    if (meLoading) return
    if (me && me.prolitterisOptOut) return
    async function fetchProlitteris() {
      fetch(
        `/api/prolitteris?paid=${
          hasActiveMembership ? 'pw' : 'na'
        }&uid=${repoId}&path=${cleanedPath}`,
      ).catch((error) => reportError('prolitterisApiError', error))
    }
    fetchProlitteris()
    setOnceAndDone(true)
  }, [me, meLoading, hasActiveMembership, onceAndDone, cleanedPath, repoId])
}

export default useProlitterisTracking
